import fs from "fs/promises";
import path from "path";

/**
 * Salva o arquivo de forma persistente no diretório public/uploads
 * e retorna a sua URL de acesso relativo local.
 */
export async function uploadToSupabase(file: File, folder: string): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Limpa o nome do arquivo para evitar caracteres especiais problemáticos na URL
    const cleanName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const filename = `${Date.now()}-${cleanName}`;
    
    // Diretório de destino
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    
    // Certifica que o diretório existe
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Salva o arquivo fisicamente
    const filePathOnDisk = path.join(uploadDir, filename);
    await fs.writeFile(filePathOnDisk, buffer);
    
    // Retorna o caminho relativo acessível pela web
    return `/uploads/${folder}/${filename}`;
  } catch (error: any) {
    console.error(`Erro ao fazer upload local (${folder}):`, error);
    throw new Error(`Erro no upload local: ${error.message}`);
  }
}
