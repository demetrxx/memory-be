export interface UploadedMultipartFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  filepath: string;
  toBuffer: () => Promise<Buffer>;
}
