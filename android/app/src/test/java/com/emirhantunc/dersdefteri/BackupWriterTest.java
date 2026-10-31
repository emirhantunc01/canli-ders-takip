package com.emirhantunc.dersdefteri;
import org.junit.Test;import static org.junit.Assert.*;import java.io.*;import java.nio.charset.StandardCharsets;
public class BackupWriterTest {
 @Test public void writesAndClosesBeforeReturning()throws Exception{final boolean[] closed={false};ByteArrayOutputStream out=new ByteArrayOutputStream(){@Override public void close()throws IOException{closed[0]=true;super.close();}};BackupWriter.write(out,"Türkçe yedek");assertTrue(closed[0]);assertEquals("Türkçe yedek",out.toString(StandardCharsets.UTF_8.name()));}
 @Test public void closeFailureIsNotSuccess()throws Exception{OutputStream out=new ByteArrayOutputStream(){@Override public void close()throws IOException{throw new IOException("provider commit failed");}};try{BackupWriter.write(out,"{}");fail("Close failure must reach caller");}catch(IOException error){assertEquals("provider commit failed",error.getMessage());}}
}
