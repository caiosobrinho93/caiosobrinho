import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Realiza o upload de um arquivo físico de forma híbrida:
 * - Se estiver rodando na Vercel (ou produção), envia para o Supabase Storage.
 * - Se estiver rodando em desenvolvimento local, salva fisicamente em public/uploads.
 */
export async function uploadToSupabase(file: File, folder: string): Promise<string> {
  const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

  if (isProduction && supabaseUrl && supabaseAnonKey) {
    try {
      console.log(`[Storage] Uploading to Supabase Storage (${folder}): ${file.name}`);
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const buffer = Buffer.from(await file.arrayBuffer());
      
      const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
      const filename = `${Date.now()}-${cleanName}`;
      const filePath = `${folder}/${filename}`;

      const { error } = await supabase.storage
        .from("nexus-vault")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("nexus-vault")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (supabaseError: any) {
      console.error(`[Storage] Supabase Storage error (${folder}):`, supabaseError);
      throw new Error(`Erro no Supabase Storage: ${supabaseError.message}`);
    }
  }

  // Fallback Local: public/uploads (localhost)
  try {
    console.log(`[Storage] Saving file to local disk (${folder}): ${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const filename = `${Date.now()}-${cleanName}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePathOnDisk = path.join(uploadDir, filename);
    await fs.writeFile(filePathOnDisk, buffer);
    
    return `/uploads/${folder}/${filename}`;
  } catch (error: any) {
    console.error(`[Storage] Local write error (${folder}):`, error);
    throw new Error(`Erro no upload local: ${error.message}`);
  }
}
