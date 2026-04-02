import React from "react";
import { Button, ModalHeader, ModalFooter } from "reactstrap";
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

export const ModalComponent = ({
  visible,
  onClose,
  title,
  content,
  onSubmit,
  width,
  showFooter,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  content?: any;
  onSubmit?: () => void;
  width?: any
  showFooter?: boolean;
}) => {

  // console.log("title",title)
  return (
      <Modal open={visible}  onClose={onClose} styles={{modal: {maxWidth: width || 900, width, zIndex: 1080}}} >
        <ModalHeader >{title}</ModalHeader>
        {content()}
        {showFooter && (
          <ModalFooter>
            <Button color="primary" onClick={onSubmit}>
              Submit
            </Button>
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        )}
      </Modal>
  );
};
