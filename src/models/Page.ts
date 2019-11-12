interface IPage {
  Id:	number
  SourceFileName:	string //	The ID of the source image file
  SourcePageNumber:	number //	The number of the image in the source file
  PageIndex: number
  SourceType:	number
  SourceDetails:	string
  Comment:	string //	Comment to the page
  ErrorText:	string //	A description of the page processing errors
  ExternalId:	string //	The external ID of the page. If left empty, the parameter is completed automatically by the Application Server and is the same as Id.
  HasAttachments:	boolean //	A flag that shows whether the page has attachments
  UncertainSymbols:	number //	The number of uncertain characters
  VerificationSymbols:	number //	The number of verified characters
  TotalSymbols:	number //	The total number of characters
  FileVersion:	number //	The version of the page file on the server
  Flags:	number //	A set of flags that describe the status of the page
}

class Page implements IPage {
  Id = 0;
  SourceFileName = "";
  SourcePageNumber = 0;
  PageIndex = 0;
  SourceType = 0;
  SourceDetails = "";
  Comment = "";
  ErrorText = "";
  ExternalId = "";
  HasAttachments = false;
  UncertainSymbols = 0;
  VerificationSymbols = 0;
  TotalSymbols = 0;
  FileVersion = 0;
  Flags = 0;

  constructor(params: IPage) {
    Object.assign(this, params);
  }
}

export default Page;