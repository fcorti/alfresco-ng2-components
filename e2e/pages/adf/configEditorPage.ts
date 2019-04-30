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

import { element, by } from 'protractor';
import { BrowserVisibility } from '@alfresco/adf-testing';

export class ConfigEditorPage {

    enterConfiguration(text) {
        const textField = element(by.css('#adf-code-configuration-editor div.overflow-guard > textarea'));
        BrowserVisibility.waitUntilElementIsVisible(textField);
        textField.sendKeys(text);
        return this;
    }

    clickSaveButton() {
        const saveButton = element(by.id('adf-configuration-save'));
        BrowserVisibility.waitUntilElementIsVisible(saveButton);
        BrowserVisibility.waitUntilElementIsClickable(saveButton);
        return saveButton.click();
    }

    clickClearButton() {
        const clearButton = element(by.id('adf-configuration-clear'));
        BrowserVisibility.waitUntilElementIsVisible(clearButton);
        BrowserVisibility.waitUntilElementIsClickable(clearButton);
        return clearButton.click();
    }

}
