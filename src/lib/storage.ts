import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Realiza o upload de um arquivo físico para o bucket do Supabase Storage
 * e retorna a sua URL pública de acesso.
 * 
 * @param file O objeto File vindo do formulário (FormData)
 * @param folder A pasta de destino dentro do bucket (ex: 'wallpapers', 'files', 'software', 'icons')
 * @returns A URL pública da imagem/arquivo salvo no Supabase
 */
export async function uploadToSupabase(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // Limpa o nome do arquivo para evitar caracteres especiais problemáticos na URL
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
    console.error(`Erro ao fazer upload no Supabase Storage (${folder}):`, error);
    throw new Error(`Erro no Supabase Storage: ${error.message}`);
  }

  // Gera a URL pública do arquivo
  const { data: { publicUrl } } = supabase.storage
    .from("nexus-vault")
    .getPublicUrl(filePath);

  return publicUrl;
}
