/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* tslint:disable:component-selector  */

import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, from } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { WidgetComponent, baseHost, LogService, FormService, ThumbnailService, ProcessContentService, AppConfigService, AppConfigValues } from '@alfresco/adf-core';
import { FormCloudService } from '../services/form-cloud.service';
import { AttachFileWidgetDialogService } from '@alfresco/adf-process-services';

@Component({
    selector: 'upload-cloud-widget',
    templateUrl: './upload-cloud.widget.html',
    styleUrls: ['./upload-cloud.widget.scss'],
    host: baseHost,
    encapsulation: ViewEncapsulation.None
})
export class UploadCloudWidgetComponent extends WidgetComponent implements OnInit {

    static ACS_SERVICE = 'alfresco-content';

    hasFile: boolean;
    displayText: string;
    multipleOption: string = '';
    mimeTypeIcon: string;

    currentFiles = [];

    @ViewChild('uploadFiles')
    fileInput: ElementRef;

    constructor(public formService: FormService,
                private thumbnailService: ThumbnailService,
                private formCloudService: FormCloudService,
                public processContentService: ProcessContentService,
                public attachDialogService: AttachFileWidgetDialogService,
                private appConfigService: AppConfigService,
                private logService: LogService) {
        super(formService);
    }

    ngOnInit() {
        if (this.field &&
            this.field.value &&
            this.field.value.length > 0) {
            this.hasFile = true;
            this.currentFiles = [...this.field.value];
        }
        this.getMultipleFileParam();
    }

    removeFile(file: any) {
        if (this.field) {
            this.removeElementFromList(file);
        }
    }

    onFileChanged(event: any) {
        const files = event.target.files;

        if (files && files.length > 0) {
            from(files)
                .pipe(mergeMap((file) => this.uploadRawContent(file)))
                .subscribe(
                    (res) => {
                        this.currentFiles.push(res);
                    },
                    (error) => this.logService.error(`Error uploading file. See console output for more details. ${error}` ),
                    () => {
                        this.fixIncompatibilityFromPreviousAndNewForm(this.currentFiles);
                        this.hasFile = true;
                    }
                );
        }
    }

    startFileUpload() {
        if (this.isContentSourceSelected()) {
            const currentECMHost = <string> this.appConfigService.get(AppConfigValues.ECMHOST);
            this.attachDialogService.openLogin(currentECMHost).subscribe(
                (selections: any[]) => {
                    selections.forEach((node) => node.isExternal = true);
                    const result = { nodeId : selections[0].id, name: selections[0].name, content: selections[0].content, createdAt: selections[0].createdAt };
                    this.currentFiles.push(result);
                    this.fixIncompatibilityFromPreviousAndNewForm(this.currentFiles);
                });
        } else {
            this.fileInput.nativeElement.click();
        }
    }

    private isContentSourceSelected(): boolean {
        return this.field.params &&
            this.field.params.fileSource &&
            this.field.params.fileSource.serviceId === UploadCloudWidgetComponent.ACS_SERVICE;
    }

    fixIncompatibilityFromPreviousAndNewForm(filesSaved) {
        this.field.form.values[this.field.id] = filesSaved;
    }

    getIcon(mimeType) {
        return this.thumbnailService.getMimeTypeIcon(mimeType);
    }

    private uploadRawContent(file): Observable<any> {
        return this.formCloudService.createTemporaryRawRelatedContent(file, this.field.form.nodeId)
            .pipe(
                map((response: any) => {
                    this.logService.info(response);
                    return { nodeId : response.id, name: response.name, content: response.content, createdAt: response.createdAt };
                }),
                catchError((err) => this.handleError(err))
            );
    }

    private handleError(error: any): any {
        return this.logService.error(error || 'Server error');
    }

    getMultipleFileParam() {
        if (this.field &&
            this.field.params &&
            this.field.params.multiple) {
            this.multipleOption = this.field.params.multiple ? 'multiple' : '';
        }
    }

    private removeElementFromList(file) {
        const index = this.currentFiles.indexOf(file);

        if (index !== -1) {
            this.currentFiles.splice(index, 1);
            this.fixIncompatibilityFromPreviousAndNewForm(this.currentFiles);
        }

        this.hasFile = this.currentFiles.length > 0;

        this.resetFormValueWithNoFiles();
    }

    private resetFormValueWithNoFiles() {
        if (this.currentFiles.length === 0) {
            this.currentFiles = [];
        }
    }

    fileClicked(nodeId: any): void {
        this.formService.formContentClicked.next(nodeId);
    }
}
