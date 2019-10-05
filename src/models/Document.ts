interface IDocument {
  Id?: number, // int The ID of the document. It is recommended to set the document ID before the document is added into a batch. Use the GetBatchIdsRange method to reserved IDs for new documents.
  BatchId?: number, // int	The ID of the batch
  ParentId?: number, // int The ID of the parent document of the set. If a new document should be part of a set, this field should be assigned the value of the parent document of the set. If a new document should not be part of any set, set the value of the field to 0. Important! The parent document must be created before child documents are created.
  ChildrenOrder?: any[], // ChildrenOrder [] A set of child documents enabling the sorting of  documents in the set. When data are read from the server, the field is filled out automatically. If this field is empty, the documents in the set will be arranged in the order in which they were added.
  DocIndex?: number, // int	Document index
  TemplateName?: string, // string	The name of the Document Definition
  ProcessingStageType?: number, // int	The type of the processing stage; values come from ProcessingStageType
  Comment?: string, // string	Comment
  Pages?: any[], // Page[]	The set of pages in the document
  IsProcessed?: boolean, // bool	A flag that shows whether the document has been processed or not
  HasProcessingErrors?: boolean, // bool	A flag that shows whether there were processing errors
  HasDocumentErrors?: boolean, // bool	A flag that shows whether there are errors in the document (e.g. format errors, rules errors, assembly errors)
  ErrorText?: string, // string	A description of the document processing errors
  ExternalId?: string, // string	The external ID of the document
  Properties?: any[], // RegistrationProperty[]	The set of registration parameters for the document
  Priority?: number, // Priority	Document priority
  FileVersion?: number, // int	The version of the document file on the server
  OwnerId?: number, // int	The ID of the user or group who owns the project
  StageExternalId?: number, // int	The ID of the processing stage in which the task was created (unique within the batch type)
  TaskId?: number, // int	The ID of the task the document belongs to
  UncertainSymbols?: number, // int	The number of uncertain characters
  VerificationSymbols?: number, // int	The number of verified characters
  TotalSymbols?: number, // int	The total number of characters in the document
  HasErrors?: boolean, // bool	A flag that shows whether there are any validation rule errors
  HasWarnings?: boolean, // bool	A flag that shows whether there are any validation rule warnings
  HasAssemblingErrors?: boolean, // bool	A flag that shows whether there were assembling errors
  HasAttachments?: boolean, // bool	A flag that shows whether the document has attachments
  Flags?: number
}

class Document implements IDocument {
  Id = 0;
  BatchId =  0;
  ParentId =  0;
  ChildrenOrder =  [];
  DocIndex =  0;
  TemplateName =  "";
  ProcessingStageType =  0;
  Comment =  "";
  Pages =  [];
  IsProcessed =  false;
  HasProcessingErrors =  false;
  HasDocumentErrors =  false;
  ErrorText =  "";
  ExternalId =  "";
  Properties =  [];
  Priority =  0;
  FileVersion =  0;
  OwnerId =  0;
  StageExternalId =  0;
  TaskId =  0;
  UncertainSymbols =  0;
  VerificationSymbols =  0;
  TotalSymbols =  0;
  HasErrors =  false;
  HasWarnings =  false;
  HasAssemblingErrors =  false;
  HasAttachments =  false;
  Flags =  0;

  constructor(params: IDocument) {
    Object.assign(this, params);
  }
}

export default Document;