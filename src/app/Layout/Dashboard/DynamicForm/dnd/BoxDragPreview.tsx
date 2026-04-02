import type { CSSProperties, FC } from "react";
import { memo, useEffect, useState } from "react";

import { Box } from "./Box";

const styles: CSSProperties = {
  display: "inline-block"
};

export interface BoxDragPreviewProps {
  title: string;
  width: number;
  height: number;
  inputType: string;
}

export interface BoxDragPreviewState {
  tickTock: any;
}

export const BoxDragPreview: FC<BoxDragPreviewProps> = memo(
  function BoxDragPreview({ title, width, height, inputType }) {

    return (
      <div style={styles}>
        <Box
          FieldName={title}
          yellow={true}
          inputType={inputType}
          preview
          FieldWidth={width}
          FieldHeight={height}
        />
      </div>
    );
  }
);
