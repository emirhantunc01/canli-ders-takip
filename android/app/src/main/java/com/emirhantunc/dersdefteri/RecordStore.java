package com.emirhantunc.dersdefteri;

import android.content.Context;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import org.json.*;
import java.time.LocalDate;
import java.util.HashSet;

public final class RecordStore implements AutoCloseable {
 private static final String EMPTY="{\"version\":2,\"lessons\":[],\"payments\":[],\"receivables\":[]}";
 private final SQLiteOpenHelper helper;
 public RecordStore(Context context,String name){
  helper=new SQLiteOpenHelper(context,name,null,1){
   @Override public void onCreate(SQLiteDatabase db){db.execSQL("CREATE TABLE snapshots(id INTEGER PRIMARY KEY CHECK(id=1),current TEXT NOT NULL,previous TEXT)");}
   @Override public void onUpgrade(SQLiteDatabase db,int oldVersion,int newVersion){throw new IllegalStateException("Desteklenmeyen veritabanı sürümü");}
   @Override public void onConfigure(SQLiteDatabase db){db.execSQL("PRAGMA synchronous=FULL");}
  };
 }
 private String column(SQLiteDatabase db,String column){try(Cursor cursor=db.query("snapshots",new String[]{column},"id=1",null,null,null,null)){return cursor.moveToFirst()&&!cursor.isNull(0)?cursor.getString(0):null;}}
 public synchronized String load(){String raw=column(helper.getReadableDatabase(),"current");if(raw==null)return EMPTY;validate(raw);return raw;}
 public synchronized String previous(){return column(helper.getReadableDatabase(),"previous");}
 public synchronized void save(String raw){
  validate(raw);SQLiteDatabase db=helper.getWritableDatabase();db.beginTransaction();
  try{String old=column(db,"current");if(old!=null)validate(old);ContentValues values=new ContentValues();values.put("id",1);values.put("current",new JSONObject(raw).toString());if(old==null)values.putNull("previous");else values.put("previous",old);if(db.insertWithOnConflict("snapshots",null,values,SQLiteDatabase.CONFLICT_REPLACE)==-1)throw new IllegalStateException("Yazılamadı");db.setTransactionSuccessful();}
  catch(JSONException error){throw new IllegalArgumentException("Geçersiz kayıt",error);}finally{db.endTransaction();}
 }
 @Override public synchronized void close(){helper.close();}
 private static void ensure(boolean value){if(!value)throw new IllegalArgumentException("Geçersiz kayıt bilgisi");}
 private static String text(JSONObject row,String key,int max,boolean required)throws JSONException{Object raw=row.get(key);ensure(raw instanceof String);String value=(String)raw;ensure(value.length()<=max&&(!required||!value.trim().isEmpty()));return value;}
 private static void kind(JSONObject row)throws JSONException{String value=text(row,"kind",10,true);ensure(value.equals("center")||value.equals("live"));}
 private static void date(JSONObject row)throws JSONException{String value=text(row,"date",10,true);ensure(value.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}"));try{ensure(LocalDate.parse(value).toString().equals(value)&&value.compareTo("2000-01-01")>=0&&value.compareTo("2100-12-31")<=0);}catch(java.time.DateTimeException error){throw new IllegalArgumentException("Geçersiz tarih",error);}}
 private static String time(JSONObject row,String key)throws JSONException{String value=text(row,key,5,true);ensure(value.matches("([01][0-9]|2[0-3]):[0-5][0-9]"));return value;}
 private static void amount(JSONObject row)throws JSONException{Object raw=row.get("amount");ensure(raw instanceof Number);double value=((Number)raw).doubleValue();ensure(Double.isFinite(value)&&value>0&&value<=10000000&&Math.abs(value*100-Math.round(value*100))<0.00001);}
 private static void collection(JSONObject root,String key,boolean lesson)throws JSONException{
  JSONArray rows=root.getJSONArray(key);ensure(rows.length()<=100000);HashSet<String> ids=new HashSet<>();
  for(int i=0;i<rows.length();i++){JSONObject row=rows.getJSONObject(i);ensure(ids.add(text(row,"id",100,true)));kind(row);date(row);text(row,"note",2000,false);
   if(!lesson){amount(row);continue;}
   String start=time(row,"start"),end=time(row,"end");ensure(end.compareTo(start)>0);
   String status=text(row,"status",20,true);ensure(status.equals("planned")||status.equals("done")||status.equals("cancelled"));text(row,"grade",40,true);text(row,"topic",200,true);
   JSONArray students=row.getJSONArray("students");ensure(students.length()>0&&students.length()<=100);for(int j=0;j<students.length();j++){Object name=students.get(j);ensure(name instanceof String&&((String)name).length()<=100&&!((String)name).trim().isEmpty());}
  }
 }
 public static void validate(String raw){
  try{ensure(raw!=null&&raw.length()<=20*1024*1024);JSONObject root=new JSONObject(raw);Object version=root.get("version");ensure(version instanceof Number);ensure(((Number)version).doubleValue()==1||((Number)version).doubleValue()==2);collection(root,"lessons",true);collection(root,"payments",false);if(root.getInt("version")==2)collection(root,"receivables",false);else ensure(!root.has("receivables"));}
  catch(JSONException error){throw new IllegalArgumentException("Geçersiz kayıt dosyası",error);}
 }
}
