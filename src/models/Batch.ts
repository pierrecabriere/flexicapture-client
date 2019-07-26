interface IBatch {
  Id?: number,	// The ID of the batch
  Name?: string, // The name of the batch
  BatchTypeId?: number,	// The ID of the batch type. 0 corresponds to the "Default" batch type
  Priority?: number,	// Batch priority. Possible values: see Priority.
  Description?: string, // A description of the batch
  ElapsedProcessingSeconds?: number,	// The time remaining until until the deadline for processing the batch, in seconds
  HasAttachments?: boolean, //	A flag that shows whether the batch has attachments
  Properties?: any[], // RegistrationProperty[]	The set of registration parameters for the batch
  StageExternalId?: number,	// The ID of the processing stage in which the task is created
  CreationDate?: number, // long
  SLAExpirationDate?: number, //	Processing deadline of the batch
  SLAStartDate?: number, // long
  DocumentsCount?: number,	// The number of documents in the batch
  RecognizedDocumentsCount?: number,	// The number of recognized documents
  AssembledDocumentsCount?: number,	// The number of assembled documents
  VerifiedDocumentsCount?: number,	// The number of verified documents
  ExportedDocumentsCount?: number,	// The number of exported documents
  PagesCount?: number,	// The number of pages in the batch
  ProjectId?: number,	// Identifier of the project the batch belongs to. Corresponds to the entry identifier in the Project table
  RecognizedSymbolsCount?: number,	// The number of recognized characters
  UncertainSymbolsCount?: number,	// The number of uncertain characters
  VerificationSymbolsCount?: number,	// The number of verified characters
  ErrorText?: string, // A description of the batch processing errors. Completed automatically by the Application Server.
  OwnerId?: number,	// The ID of the user or group who owns the project
  CreatorId?: number,	// The ID of the user who created the batch (completed when the batch is being created; cannot be modified later)
}

class Batch implements IBatch {
  Id = 0;
  Name = "";
  BatchTypeId = 0;
  Priority = 0;
  Description = "";
  ElapsedProcessingSeconds = 0;
  HasAttachments = false;
  Properties = [];
  StageExternalId = 0;
  CreationDate = new Date().getTime();
  SLAExpirationDate = null;
  SLAStartDate = null;
  DocumentsCount = 0;
  RecognizedDocumentsCount = 0;
  AssembledDocumentsCount = 0;
  VerifiedDocumentsCount = 0;
  ExportedDocumentsCount = 0;
  PagesCount = 0;
  ProjectId = 0;
  RecognizedSymbolsCount = 0;
  UncertainSymbolsCount = 0;
  VerificationSymbolsCount = 0;
  ErrorText = "";
  OwnerId = 0;
  CreatorId = 0;

  constructor(params: IBatch) {
    Object.assign(this, params);
  }
}

export default Batch;