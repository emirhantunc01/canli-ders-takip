package com.emirhantunc.dersdefteri;
import android.content.Context;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.*;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;
import org.json.JSONObject;
@RunWith(AndroidJUnit4.class)
public class RecordStoreTest {
 private Context context; private RecordStore store;
 private static final String DB="records-instrumentation-test.sqlite";
 private static final String DATA="{\"version\":2,\"lessons\":[],\"payments\":[],\"receivables\":[{\"id\":\"r\",\"kind\":\"center\",\"date\":\"2026-10-31\",\"amount\":5000,\"note\":\"\"}]}";
 @Before public void setup(){context=InstrumentationRegistry.getInstrumentation().getTargetContext();context.deleteDatabase(DB);store=new RecordStore(context,DB);}
 @After public void cleanup(){store.close();context.deleteDatabase(DB);}
 @Test public void saveSurvivesReopen() throws Exception {store.save(DATA);store.close();store=new RecordStore(context,DB);assertEquals(5000,new JSONObject(store.load()).getJSONArray("receivables").getJSONObject(0).getInt("amount"));}
 @Test public void rejectsInvalidAndKeepsPrevious() throws Exception {store.save(DATA);try{store.save(DATA.replace("5000","-1"));fail("Invalid amount must be rejected");}catch(IllegalArgumentException expected){} assertEquals(5000,new JSONObject(store.load()).getJSONArray("receivables").getJSONObject(0).getInt("amount"));}
 @Test public void previousVersionAndLegacyArePreserved() throws Exception {String legacy="{\"version\":1,\"lessons\":[],\"payments\":[]}";store.save(legacy);store.save(DATA);assertEquals(1,new JSONObject(store.previous()).getInt("version"));assertEquals(2,new JSONObject(store.load()).getInt("version"));}
 @Test public void rejectsInvalidDateAndDuplicate(){for(String raw:new String[]{DATA.replace("2026-10-31","2026-02-30"),DATA.replace("5000","0"),DATA.replace("5000","1.123"),"{}"}){try{RecordStore.validate(raw);fail("Invalid snapshot accepted");}catch(IllegalArgumentException expected){}}}
}
