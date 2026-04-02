import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';

export interface PDFSize {
  PageType: string;
  PageHeight: string;
  PageWidth: string;
}

export interface PDFSettings {
  size: PDFSize;
  orientation: 'portrait' | 'landscape';
}

export interface PDFSizeModalProps {
  isOpen: boolean;
  toggle: () => void;
  pdfSizes: PDFSize[];
  selectedSettings: PDFSettings | null;
  onSelectSettings: (settings: PDFSettings) => void;
  onApply: () => void;
}

const PDFSizeModal: React.FC<PDFSizeModalProps> = ({
  isOpen,
  toggle,
  pdfSizes,
  selectedSettings,
  onSelectSettings,
  onApply,
}) => {
  const [tempSize, setTempSize] = useState<PDFSize | null>(selectedSettings?.size || null);
  const [tempOrientation, setTempOrientation] = useState<'portrait' | 'landscape'>(selectedSettings?.orientation || 'portrait');

  useEffect(() => {
    if (selectedSettings) {
      setTempSize(selectedSettings.size);
      setTempOrientation(selectedSettings.orientation);
    } else if (pdfSizes && pdfSizes.length > 0) {
      setTempSize(pdfSizes[0]);
      setTempOrientation('portrait');
    }
  }, [selectedSettings, pdfSizes]);

console.log("pdfSizespdfSizes", pdfSizes)
  const handleApply = () => {
    if (tempSize) {
      onSelectSettings({
        size: tempSize,
        orientation: tempOrientation,
      });
      onApply();
      toggle();
    }
  };

  if (!pdfSizes || pdfSizes.length === 0) {
    return (
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader>PDF Size</ModalHeader>
        <ModalBody>
          <p>No PDF sizes available.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader>Select PDF Size and Orientation</ModalHeader>
      <ModalBody>
        <Row>
          <Col md={6}>
            <FormGroup tag="fieldset">
              <legend>Page Size</legend>
              {pdfSizes.map((size, index) => (
                <FormGroup check key={index}>
                  <Label check>
                    <Input
                      type="radio"
                      name="pdfSize"
                      checked={tempSize?.PageType === size.PageType}
                      onChange={() => setTempSize(size)}
                    />{' '}
                    {size.PageType} ({size.PageWidth} × {size.PageHeight} pts)
                  </Label>
                </FormGroup>
              ))}
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup tag="fieldset">
              <legend>Orientation</legend>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    name="orientation"
                    checked={tempOrientation === 'portrait'}
                    onChange={() => setTempOrientation('portrait')}
                  />{' '}
                  Portrait
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input
                    type="radio"
                    name="orientation"
                    checked={tempOrientation === 'landscape'}
                    onChange={() => setTempOrientation('landscape')}
                  />{' '}
                  Landscape
                </Label>
              </FormGroup>
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleApply}>Apply</Button>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default PDFSizeModal;