package com.emirhantunc.dersdefteri;
import java.io.*;import java.nio.charset.StandardCharsets;
public final class BackupWriter {
 public static void write(OutputStream out,String raw)throws IOException{
  if(out==null||raw==null)throw new IOException("Yedek hedefi açılamadı.");
  try(OutputStream target=out){target.write(raw.getBytes(StandardCharsets.UTF_8));target.flush();}
 }
}
