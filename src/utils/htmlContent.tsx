import { Button, Modal } from "reactstrap";

// HTML Content Modal Component
const HtmlContentModal = ({ 
  isOpen, 
  onClose, 
  htmlContent, 
  title 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  htmlContent: string; 
  title: string;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      size="xl"
      centered
      className="html-content-modal shadow-none"
      backdrop="static"
    >
      <div className="modal-header">
        <h5 className="modal-title">{title || "HTML Content"}</h5>
        <button
          type="button"
          className="close"
          onClick={onClose}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="modal-body" style={{ 
        maxHeight: '70vh', 
        overflowY: 'auto',
        padding: '20px'
      }}>
        {htmlContent ? (
          <div 
            dangerouslySetInnerHTML={{ __html: htmlContent }} 
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          />
        ) : (
          <div className="text-center text-muted py-5">
            No content available
          </div>
        )}
      </div>
      <div className="modal-footer">
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default HtmlContentModal;