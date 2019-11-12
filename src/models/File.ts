interface IFile {
  Name?: string, // string	The name of the file
  Bytes?: any, // System.byte[]	The binary data of the file
}

class File implements IFile {
  Name;
  Bytes;

  constructor(params?: IFile) {
    Object.assign(this, params);
  }
}

export default File;