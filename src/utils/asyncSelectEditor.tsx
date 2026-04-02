import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';

export interface AsyncSelectEditorProps {
  value: any;
  api: any;
  column: any;
  rowIndex: number;
  data: any;
  onChangeInput: (e: any) => void;
  promiseOptions: (inputValue: string) => Promise<any>;
  dropDownArray: any[];
  onInputChange: (newValue: string, column: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export const AsyncSelectEditor = forwardRef((props: AsyncSelectEditorProps, ref) => {
  const selectRef = useRef<any>(null);
  const initialValue = props.value ? { label: props.value, value: props.value } : { label: '', value: '' };
  const [value, setValue] = useState(initialValue);

  useEffect(() => { 
    // Focus the AsyncSelect input when the editor is initialized
    setTimeout(() => {
      selectRef.current?.focus();
    }, 0);
  }, []);

  useImperativeHandle(ref, () => ({
    getValue() {
      return value.value;
    },
    isPopup() {
      return true; // Ensures the dropdown appears above other elements
    },
    afterGuiAttached() {
      selectRef.current?.focus();
    },
  }));

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()} // Prevent AG Grid from closing the editor
      onClick={(e) => e.stopPropagation()}
    >
      <AsyncSelect
        ref={selectRef}
        loadOptions={props.promiseOptions}
        defaultOptions={props.dropDownArray}
        onChange={(selectedOption: any) => {
          setValue(selectedOption || { label: '', value: '' });
          props.onChangeInput({
            target: { name: props.column.colId, value: selectedOption ? selectedOption.value : '' },
            row: props.data,
          });
        }}
        value={value}
        onInputChange={(val) => props.onInputChange(val, props.column.colId)}
        isLoading={props.isLoading}
        isDisabled={props.isDisabled}
        noOptionsMessage={() => 'No Suggestions'}
        onFocus={() => {
          props.onInputChange('', props.column.colId);
        }}
        menuPortalTarget={document.body} // Render dropdown in body to avoid clipping
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          container: (base) => ({ ...base, width: '100%' }),
        }}
        menuPlacement="auto"
      />
    </div>
  );
});
