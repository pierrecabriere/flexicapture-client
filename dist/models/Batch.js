"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Batch {
    constructor(params) {
        this.Id = 0;
        this.Name = "";
        this.BatchTypeId = 0;
        this.Priority = 0;
        this.Description = "";
        this.ElapsedProcessingSeconds = 0;
        this.HasAttachments = false;
        this.Properties = [];
        this.StageExternalId = 0;
        this.CreationDate = new Date().getTime();
        this.SLAExpirationDate = null;
        this.SLAStartDate = null;
        this.DocumentsCount = 0;
        this.RecognizedDocumentsCount = 0;
        this.AssembledDocumentsCount = 0;
        this.VerifiedDocumentsCount = 0;
        this.ExportedDocumentsCount = 0;
        this.PagesCount = 0;
        this.ProjectId = 0;
        this.RecognizedSymbolsCount = 0;
        this.UncertainSymbolsCount = 0;
        this.VerificationSymbolsCount = 0;
        this.ErrorText = "";
        this.OwnerId = 0;
        this.CreatorId = 0;
        Object.assign(this, params);
    }
}
exports.default = Batch;
