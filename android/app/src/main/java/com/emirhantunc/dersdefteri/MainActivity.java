package com.emirhantunc.dersdefteri;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import android.view.View;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends Activity {
 private static final String HOME="https://appassets.androidplatform.net/assets/www/index.html";
 private static final int IMPORT=11,EXPORT=12;
 private WebView web; private RecordStore records; private ValueCallback<Uri[]> fileCallback;
 private String pendingExport; private boolean pageReady=false;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);records=new RecordStore(this,"records.sqlite");
  web=new WebView(this);web.setBackgroundColor(Color.rgb(230,240,246));setContentView(web);
  WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(false);settings.setAllowContentAccess(true);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  // Keep the app viewport fixed; native accessibility magnification remains available.
  settings.setSupportZoom(false);settings.setBuiltInZoomControls(false);settings.setDisplayZoomControls(false);
  settings.setSupportMultipleWindows(false);settings.setJavaScriptCanOpenWindowsAutomatically(false);settings.setTextZoom(100);
  WebViewAssetLoader assets=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){WebResourceResponse response=assets.shouldInterceptRequest(request.getUrl());if(response!=null)return response;return new WebResourceResponse("text/plain","UTF-8",403,"Blocked",java.util.Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return !request.getUrl().toString().equals(HOME)&&!request.getUrl().toString().equals(HOME+"#");}
   @Override public void onPageFinished(WebView view,String url){pageReady=HOME.equals(url)|| (HOME+"#").equals(url);}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onPermissionRequest(PermissionRequest request){request.deny();}
   @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;
    Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*").putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","text/plain","application/octet-stream"});
    try{startActivityForResult(pick,IMPORT);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;Toast.makeText(MainActivity.this,"Dosya seçici açılamadı.",Toast.LENGTH_LONG).show();}return true;
   }
  });
  web.addJavascriptInterface(new PhoneBridge(),"DersAndroid");web.loadUrl(HOME);
 }
 private String reply(boolean ok,String error,String data){try{JSONObject result=new JSONObject().put("ok",ok);if(error!=null)result.put("error",error);if(data!=null)result.put("data",new JSONObject(data));return result.toString();}catch(Exception e){return "{\"ok\":false,\"error\":\"Veri okunamadı.\"}";}}
 public class PhoneBridge {
  @JavascriptInterface public void minimize(){runOnUiThread(()->moveTaskToBack(true));}
  @JavascriptInterface public String load(){try{return reply(true,null,records.load());}catch(Exception e){return reply(false,"Telefon kaydı açılamadı. Veriler korunuyor; yeniden deneyin.",null);}}
  @JavascriptInterface public String save(String raw){try{records.save(raw);return reply(true,null,null);}catch(Exception e){return reply(false,"Kayıt saklanamadı. Veriler değiştirilmedi; boş alanı kontrol edin.",null);}}
  @JavascriptInterface public String exportBackup(String raw,String filename){
   try{RecordStore.validate(raw);synchronized(MainActivity.this){if(pendingExport!=null)throw new IllegalStateException();pendingExport=raw;}
    runOnUiThread(()->{try{Intent create=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,"ders-defteri-"+java.time.LocalDate.now()+".json");startActivityForResult(create,EXPORT);}catch(Exception e){pendingExport=null;notifyExport(false,false,"Yedek seçici açılamadı.");}});return reply(true,null,null);
   }catch(Exception e){return reply(false,"Yedek işlemi başlatılamadı.",null);}
  }
 }
 private void notifyExport(boolean ok,boolean cancelled,String error){try{JSONObject detail=new JSONObject().put("ok",ok).put("cancelled",cancelled);if(error!=null)detail.put("error",error);web.evaluateJavascript("window.dispatchEvent(new CustomEvent('ders-backup-result',{detail:"+detail+"}))",null);}catch(Exception ignored){}}
 @Override protected void onActivityResult(int request,int result,Intent data){
  super.onActivityResult(request,result,data);
  if(request==IMPORT){if(fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null);fileCallback=null;}return;}
  if(request==EXPORT){String raw=pendingExport;pendingExport=null;if(result!=RESULT_OK||data==null||data.getData()==null){notifyExport(false,true,null);return;}
   try{if(raw==null)throw new IOException("Yedek işlemi yeniden başlatılmalı.");BackupWriter.write(getContentResolver().openOutputStream(data.getData(),"wt"),raw);notifyExport(true,false,null);}catch(Exception e){notifyExport(false,false,"Yedek kaydedilemedi. Başka bir klasör seçin.");}
  }
 }
 @Override public void onBackPressed(){if(pageReady)web.evaluateJavascript("window.dispatchEvent(new Event('ders-back'))",result->{});else super.onBackPressed();}
 @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);if(web!=null){web.removeJavascriptInterface("DersAndroid");web.destroy();}if(records!=null)records.close();super.onDestroy();}
}

