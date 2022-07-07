/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import $ from"jquery";import Icons from"@typo3/backend/icons.js";import PersistentStorage from"@typo3/backend/storage/persistent.js";import RegularEvent from"@typo3/core/event/regular-event.js";import Tooltip from"@typo3/backend/tooltip.js";import DocumentService from"@typo3/core/document-service.js";import Modal from"@typo3/backend/modal.js";import{SeverityEnum}from"@typo3/backend/enum/severity.js";import Severity from"@typo3/backend/severity.js";class Recordlist{constructor(){this.identifier={entity:".t3js-entity",toggle:".t3js-toggle-recordlist",localize:".t3js-action-localize",searchboxToolbar:"#db_list-searchbox-toolbar",searchboxToggle:".t3js-toggle-search-toolbox",searchField:"#search_field",icons:{collapse:"actions-view-list-collapse",expand:"actions-view-list-expand",editMultiple:".t3js-record-edit-multiple"}},this.toggleClick=(e,t)=>{e.preventDefault();const i=$(t),o=i.data("table"),a=$(i.data("bs-target")),n="expanded"===a.data("state"),l=i.find(".collapseIcon"),r=n?this.identifier.icons.expand:this.identifier.icons.collapse;Icons.getIcon(r,Icons.sizes.small).then(e=>{l.html(e)});let s={};PersistentStorage.isset("moduleData.web_list.collapsedTables")&&(s=PersistentStorage.get("moduleData.web_list.collapsedTables"));const d={};d[o]=n?1:0,$.extend(s,d),PersistentStorage.set("moduleData.web_list.collapsedTables",s).done(()=>{a.data("state",n?"collapsed":"expanded")})},this.onEditMultiple=e=>{e.preventDefault();let t="",i="",o="",a=[];if("multiRecordSelection:action:edit"===e.type){const o=e.detail,n=o.configuration;if(i=n.returnUrl||"",t=n.tableName||"",""===t)return;o.checkboxes.forEach(e=>{const t=e.closest("tr");null!==t&&t.dataset[n.idField]&&a.push(t.dataset[n.idField])})}else{const n=e.currentTarget,l=n.closest("[data-table]");if(null===l)return;if(t=l.dataset.table||"",""===t)return;i=n.dataset.returnUrl||"",o=n.dataset.columnsOnly||"";const r=l.querySelectorAll(this.identifier.entity+'[data-uid][data-table="'+t+'"] td.col-selector input[type="checkbox"]:checked');if(r.length)r.forEach(e=>{a.push(e.closest(this.identifier.entity+'[data-uid][data-table="'+t+'"]').dataset.uid)});else{const e=l.querySelectorAll(this.identifier.entity+'[data-uid][data-table="'+t+'"]');if(!e.length)return;e.forEach(e=>{a.push(e.dataset.uid)})}}if(!a.length)return;let n=top.TYPO3.settings.FormEngine.moduleUrl+"&edit["+t+"]["+a.join(",")+"]=edit&returnUrl="+Recordlist.getReturnUrl(i);""!==o&&(n+="&columnsOnly="+o),window.location.href=n},this.disableButton=e=>{$(e.currentTarget).prop("disable",!0).addClass("disabled")},this.toggleSearchbox=()=>{const e=$(this.identifier.searchboxToolbar);e.toggle(),e.is(":visible")&&$(this.identifier.searchField).focus()},this.deleteRow=e=>{const t=$(`table[data-table="${e.table}"]`),i=t.find(`tr[data-uid="${e.uid}"]`),o=t.closest(".panel"),a=o.find(".panel-heading"),n=t.find(`[data-l10nparent="${e.uid}"]`),l=$().add(i).add(n);if(l.fadeTo("slow",.4,()=>{l.slideUp("slow",()=>{l.remove(),0===t.find("tbody tr").length&&o.slideUp("slow")})}),"0"===i.data("l10nparent")||""===i.data("l10nparent")){const e=Number(a.find(".t3js-table-total-items").html());a.find(".t3js-table-total-items").text(e-1)}"pages"===e.table&&top.document.dispatchEvent(new CustomEvent("typo3:pagetree:refresh"))},this.registerPaginationEvents=()=>{document.querySelectorAll(".t3js-recordlist-paging").forEach(e=>{e.addEventListener("keyup",t=>{t.preventDefault();let i=parseInt(e.value,10);i<parseInt(e.min,10)&&(i=parseInt(e.min,10)),i>parseInt(e.max,10)&&(i=parseInt(e.max,10)),"Enter"===t.key&&i!==parseInt(e.dataset.currentpage,10)&&(window.location.href=e.dataset.currenturl+i.toString())})})},new RegularEvent("click",this.toggleClick).delegateTo(document,this.identifier.toggle),$(document).on("click",this.identifier.icons.editMultiple,this.onEditMultiple),$(document).on("click",this.identifier.localize,this.disableButton),$(document).on("click",this.identifier.searchboxToggle,this.toggleSearchbox),DocumentService.ready().then(()=>{Tooltip.initialize(".table-fit a[title]"),this.registerPaginationEvents()}),new RegularEvent("typo3:datahandler:process",this.handleDataHandlerResult.bind(this)).bindTo(document),new RegularEvent("multiRecordSelection:action:edit",this.onEditMultiple).bindTo(document),new RegularEvent("multiRecordSelection:action:delete",this.deleteMultiple).bindTo(document),new RegularEvent("multiRecordSelection:action:copyMarked",e=>{Recordlist.submitClipboardFormWithCommand("copyMarked",e.target)}).bindTo(document),new RegularEvent("multiRecordSelection:action:removeMarked",e=>{Recordlist.submitClipboardFormWithCommand("removeMarked",e.target)}).bindTo(document)}static submitClipboardFormWithCommand(e,t){const i=t.closest("form");if(!i)return;const o=i.querySelector('input[name="cmd"]');o&&(o.value=e,i.submit())}static getReturnUrl(e){return""===e&&(e=top.list_frame.document.location.pathname+top.list_frame.document.location.search),encodeURIComponent(e)}handleDataHandlerResult(e){const t=e.detail.payload;t.hasErrors||"datahandler"!==t.component&&"delete"===t.action&&this.deleteRow(t)}deleteMultiple(e){e.preventDefault();const t=e.detail.configuration;Modal.advanced({title:t.title||"Delete",content:t.content||"Are you sure you want to delete those records?",severity:SeverityEnum.warning,buttons:[{text:TYPO3.lang["button.close"]||"Close",active:!0,btnClass:"btn-default",trigger:()=>Modal.currentModal.trigger("modal-dismiss")},{text:t.ok||TYPO3.lang["button.ok"]||"OK",btnClass:"btn-"+Severity.getCssClass(SeverityEnum.warning),trigger:()=>{Modal.currentModal.trigger("modal-dismiss"),Recordlist.submitClipboardFormWithCommand("delete",e.target)}}]})}}export default new Recordlist;