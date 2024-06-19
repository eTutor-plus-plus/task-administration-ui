import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { editor as monaco } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { NgxTiptapModule } from 'ngx-tiptap';

/**
 * Custom WYSIWYG editor.
 */
@Component({
  selector: 'dke-editor',
  standalone: true,
  imports: [
    NgxTiptapModule,
    NgClass,
    NgStyle,
    OverlayPanelModule,
    InputTextModule,
    ButtonDirective,
    TranslocoDirective,
    MonacoEditorModule,
    TranslocoPipe,
    FormsModule
  ],
  templateUrl: './dke-editor.component.html',
  styleUrl: './dke-editor.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DkeEditorComponent,
    multi: true
  }]
})
export class DkeEditorComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  /**
   * The editor.
   */
  readonly editor = new Editor({
    extensions: [
      StarterKit.configure({heading: {levels: [1, 2]}}),
      Underline,
      TextAlign.configure({types: ['heading', 'paragraph']}),
      Table, TableRow, TableCell, TableHeader,
      Image.configure({allowBase64: true}),
      Link.configure({autolink: false, openOnClick: false, protocols: ['http', 'https']})
    ]
  });

  /**
   * The monaco editor options.
   */
  monacoOptions: monaco.IStandaloneEditorConstructionOptions = {
    language: 'html',
    scrollBeyondLastLine: false,
    minimap: {enabled: false},
    automaticLayout: true
  };

  /**
   * The height in pixels.
   */
  @Input() height = 200;

  /**
   * The link panel.
   */
  @ViewChild('linkPanel') linkPanel!: OverlayPanel;

  /**
   * The link input field.
   */
  @ViewChild('linkInput') linkInput?: ElementRef;

  /**
   * The file input.
   */
  @ViewChild('fileInput') fileInput!: ElementRef;

  /**
   * Whether to show the monaco editor.
   */
  showMonaco: boolean;

  /**
   * Whether the control should be disabled.
   */
  isDisabled: boolean;

  /**
   * The current value.
   */
  value: string;

  private _monacoEditor?: monaco.IEditor;
  private _onChange?: (_: any) => void;
  private _onTouched?: () => void;

  /**
   * Creates a new instance of class EditorComponent.
   */
  constructor() {
    this.showMonaco = false;
    this.isDisabled = false;
    this.value = '';
  }

  //#region --- Lifecycle Hooks ---

  /**
   * A lifecycle hook that is called after Angular has initialized all data-bound properties of a directive.
   */
  ngOnInit(): void {
    this.editor.on('blur', () => {
      if (this._onTouched)
        this._onTouched();
    });
    this.editor.on('update', props => {
      if (!props.transaction.docChanged)
        return;
      if (!this._onChange)
        return;
      this._onChange(props.editor.getHTML());
    });
  }

  /**
   * A lifecycle hook that is called after Angular has fully initialized a component's view.
   */
  ngAfterViewInit(): void {
    (this.fileInput.nativeElement as HTMLInputElement).addEventListener('change', event => this.setImage());
  }

  //#endregion

  //#region --- Value Accessor ---

  /**
   * Writes a new value to the element.
   *
   * @param obj The new value for the element.
   */
  writeValue(obj: any): void {
    this.value = obj;
  }

  /**
   * Registers a callback function that is called when the control's value changes in the UI.
   *
   * @param fn The callback function.
   */
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Registers a callback function that is called by the forms API on initialization to update the form model on blur.
   *
   * @param fn The callback function.
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Function that is called by the forms API when the control status changes to or from 'DISABLED'.
   *
   * @param isDisabled Whether the form control is disabled or not.
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.editor.setEditable(!isDisabled);
    this.monacoOptions = {...this.monacoOptions, readOnly: isDisabled};
  }

  //#endregion

  /**
   * Focuses the editor.
   */
  focusEditor() {
    if (this.editor.isFocused)
      return;
    this.editor.chain().focus().run();
  }

  //#region --- Monaco ---

  /**
   * Toggles between monaco editor and tiptap editor.
   */
  toggleMonaco(): void {
    if (this.showMonaco) {
    } else {
      this.editor.getHTML();
    }
    this.showMonaco = !this.showMonaco;
    this._monacoEditor?.trigger('editor', 'editor.action.formatDocument', undefined);
  }

  /**
   * Initializes the monaco editor.
   *
   * @param editor The editor.
   */
  onMonacoInit(editor: any) {
    this._monacoEditor = editor;
  }

  /**
   * Triggers a monaco editor change.
   *
   * @param value The new value.
   */
  onModelChanged(): void {
    if (this._onChange)
      this._onChange(this.value);
  }

  //#endregion

  //#region --- Formatting ---
  /**
   * Format as bold text.
   */
  formatBold(): void {
    this.editor.chain().focus().toggleBold().run();
  }

  /**
   * Formats as italic text.
   */
  formatItalic(): void {
    this.editor.chain().focus().toggleItalic().run();
  }

  /**
   * Formats as underlined text.
   */
  formatUnderline(): void {
    this.editor.chain().focus().toggleUnderline().run();
  }

  /**
   * Formats as code text.
   */
  formatCode(): void {
    this.editor.chain().focus().toggleCode().run();
  }

  //#endregion

  //#region --- Paragraphs ---

  /**
   * Creates a H1 node.
   */
  heading1(): void {
    this.editor.chain().focus().setHeading({level: 1}).run();
  }

  /**
   * Creates a H2 node.
   */
  heading2(): void {
    this.editor.chain().focus().setHeading({level: 2}).run();
  }

  /**
   * Creates a paragraph node.
   */
  paragraph(): void {
    this.editor.chain().focus().setParagraph().run();
  }

  /**
   * Creates a code node.
   */
  code(): void {
    this.editor.chain().focus().toggleCodeBlock().run();
  }

  //#endregion

  //#region --- Lists ---

  /**
   * Creates an ordered list.
   */
  orderedList() {
    this.editor.chain().focus().toggleOrderedList().run();
  }

  /**
   * Creates an unordered list.
   */
  unorderedList() {
    this.editor.chain().focus().toggleBulletList().run();
  }

  //#endregion

  //#region --- Align ---

  /**
   * Aligns the text left.
   *
   * @param alignment Where to align.
   */
  align(alignment: 'left' | 'right' | 'center' | 'justify'): void {
    this.editor.chain().focus().setTextAlign(alignment).run();
  }

  //#endregion

  //#region --- Table ---

  /**
   * Inserts a new table.
   */
  insertTable(): void {
    this.editor.chain().focus().insertTable({rows: 3, cols: 2, withHeaderRow: true}).run();
  }

  /**
   * Adds a new column.
   */
  addColumn(): void {
    this.editor.chain().focus().addColumnAfter().run();
  }

  /**
   * Adds a new row.
   */
  addRow(): void {
    this.editor.chain().focus().addRowAfter().run();
  }

  /**
   * Removes a row.
   */
  removeRow() {
    this.editor.chain().focus().deleteRow().run();
  }

  //#endregion

  //#region --- Link ---

  /**
   * Opens the edit popup for links.
   */
  editLink(event: Event): void {
    if (!this.editor.can().setLink({href: 'http://test'}))
      return;

    const existingLink = this.editor.getAttributes('link')['href'];
    if (this.editor.state.selection.empty && !existingLink)
      return;

    (this.linkInput?.nativeElement as HTMLInputElement).value = existingLink ?? '';
    this.linkPanel.show(event);
    (this.linkInput?.nativeElement as HTMLInputElement).focus();
  }

  /**
   * Sets the link.
   *
   * @param value
   */
  setLink(value: string): void {
    if (value.trim().length === 0)
      this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else
      this.editor.chain().focus().extendMarkRange('link').setLink({href: value}).run();
    this.linkPanel.hide();
  }

  //#endregion

  //#region --- Image ---

  /**
   * Opens the file selector.
   */
  addImage(): void {
    (this.fileInput.nativeElement as HTMLInputElement).files = null;
    (this.fileInput.nativeElement as HTMLInputElement).click();
  }

  /**
   * Read and add an image.
   */
  setImage(): void {
    const files = (this.fileInput.nativeElement as HTMLInputElement).files;
    if (files === null || files.length === 0)
      return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      this.editor.chain().focus().setImage({src: reader.result + ''}).run();
    };
    reader.readAsDataURL(file);
  }

  //#endregion
}
