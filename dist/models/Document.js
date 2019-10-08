"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Document {
    constructor(params) {
        this.Id = 0;
        this.BatchId = 0;
        this.ParentId = 0;
        this.ChildrenOrder = [];
        this.DocIndex = 0;
        this.TemplateName = "";
        this.ProcessingStageType = 0;
        this.Comment = "";
        this.Pages = [];
        this.IsProcessed = false;
        this.HasProcessingErrors = false;
        this.HasDocumentErrors = false;
        this.ErrorText = "";
        this.ExternalId = "";
        this.Properties = [];
        this.Priority = 0;
        this.FileVersion = 0;
        this.OwnerId = 0;
        this.StageExternalId = 0;
        this.TaskId = 0;
        this.UncertainSymbols = 0;
        this.VerificationSymbols = 0;
        this.TotalSymbols = 0;
        this.HasErrors = false;
        this.HasWarnings = false;
        this.HasAssemblingErrors = false;
        this.HasAttachments = false;
        this.Flags = 0;
        Object.assign(this, params);
    }
}
exports.default = Document;
