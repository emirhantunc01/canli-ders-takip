package com.emirhantunc.dersdefteri;
import android.app.Activity;import android.app.Instrumentation;import android.content.Intent;import android.os.SystemClock;import android.view.*;import android.webkit.WebView;
import androidx.test.platform.app.InstrumentationRegistry;import androidx.test.ext.junit.runners.AndroidJUnit4;
import org.junit.Test;import org.junit.runner.RunWith;import static org.junit.Assert.*;import java.util.concurrent.atomic.AtomicReference;
@RunWith(AndroidJUnit4.class)
public class ZoomGestureTest {
 private final Instrumentation instrumentation=InstrumentationRegistry.getInstrumentation();
 private void touch(long down,long time,int action,float x1,float x2,float y,int count){
  MotionEvent.PointerProperties[] properties=new MotionEvent.PointerProperties[count];MotionEvent.PointerCoords[] coords=new MotionEvent.PointerCoords[count];
  for(int i=0;i<count;i++){properties[i]=new MotionEvent.PointerProperties();properties[i].id=i;properties[i].toolType=MotionEvent.TOOL_TYPE_FINGER;coords[i]=new MotionEvent.PointerCoords();coords[i].x=i==0?x1:x2;coords[i].y=y;coords[i].pressure=1;coords[i].size=1;}
  MotionEvent event=MotionEvent.obtain(down,time,action,count,properties,coords,0,0,1,1,0,0,InputDevice.SOURCE_TOUCHSCREEN,0);instrumentation.sendPointerSync(event);event.recycle();
 }
 @Test public void appGesturesKeepScaleAndVerticalScrollingStillWorks()throws Exception{
  Intent intent=new Intent(instrumentation.getTargetContext(),MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
  Activity activity=instrumentation.startActivitySync(intent);AtomicReference<WebView> target=new AtomicReference<>();
  try{
   instrumentation.runOnMainSync(()->target.set((WebView)((ViewGroup)activity.findViewById(android.R.id.content)).getChildAt(0)));
   WebView web=target.get();long deadline=SystemClock.uptimeMillis()+15000;final boolean[] ready={false};
   do{instrumentation.runOnMainSync(()->ready[0]=web.getProgress()==100&&web.getContentHeight()>0);if(!ready[0])SystemClock.sleep(100);}while(!ready[0]&&SystemClock.uptimeMillis()<deadline);assertTrue("Page loaded",ready[0]);
   final float[] scale={0};final int[] geometry=new int[4];
   instrumentation.runOnMainSync(()->{assertFalse("App must disable gesture zoom",web.getSettings().supportZoom());scale[0]=web.getScale();int[] position=new int[2];web.getLocationOnScreen(position);geometry[0]=position[0];geometry[1]=position[1];geometry[2]=web.getWidth();geometry[3]=web.getHeight();});
   float cx=geometry[0]+geometry[2]/2f,cy=geometry[1]+geometry[3]/2f;long down=SystemClock.uptimeMillis();
   touch(down,down,MotionEvent.ACTION_DOWN,cx-30,cx+30,cy,1);touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_POINTER_DOWN|(1<<MotionEvent.ACTION_POINTER_INDEX_SHIFT),cx-30,cx+30,cy,2);
   for(int i=1;i<=20;i++){SystemClock.sleep(16);float distance=30+i*geometry[2]/80f;touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,cx-distance,cx+distance,cy,2);}
   touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_POINTER_UP|(1<<MotionEvent.ACTION_POINTER_INDEX_SHIFT),cx-geometry[2]/4f,cx+geometry[2]/4f,cy,2);touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_UP,cx-geometry[2]/4f,cx,cy,1);
   SystemClock.sleep(500);instrumentation.runOnMainSync(()->assertEquals("Pinch must not change scale",scale[0],web.getScale(),.01f));
   for(int tap=0;tap<2;tap++){long time=SystemClock.uptimeMillis();touch(time,time,MotionEvent.ACTION_DOWN,cx,cx,cy,1);touch(time,SystemClock.uptimeMillis()+20,MotionEvent.ACTION_UP,cx,cx,cy,1);SystemClock.sleep(60);}
   SystemClock.sleep(500);instrumentation.runOnMainSync(()->assertEquals("Double tap must not change scale",scale[0],web.getScale(),.01f));
   down=SystemClock.uptimeMillis();float start=geometry[1]+geometry[3]*.75f;touch(down,down,MotionEvent.ACTION_DOWN,cx,cx,start,1);
   for(int i=1;i<=20;i++){SystemClock.sleep(16);touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_MOVE,cx,cx,start-i*geometry[3]*.02f,1);}
   touch(down,SystemClock.uptimeMillis(),MotionEvent.ACTION_UP,cx,cx,start-geometry[3]*.4f,1);SystemClock.sleep(300);instrumentation.runOnMainSync(()->assertTrue("Vertical scrolling remains available",web.getScrollY()>0));
  }finally{instrumentation.runOnMainSync(activity::finish);}
 }
}
