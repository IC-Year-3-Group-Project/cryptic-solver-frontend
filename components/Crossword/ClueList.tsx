import { MouseEvent, useState } from "react";
import { Clue } from "./model/Clue";
import IconButton from "@mui/material/IconButton";
import Edit from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export interface ClueListProps {
  title: string;
  clues: Clue[];
  selectedClue?: Clue;
  onClueClicked?: (clue: Clue) => void;
}

export default function ClueList(props: ClueListProps) {
  const { title, clues, onClueClicked, selectedClue } = props;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editClueText, setEditClueText] = useState("");
  const [editClueError, setEditClueError] = useState<string>();

  function saveClueEdits() {
    const trimmed = editClueText.trim();
    if (trimmed.length == 0) {
      setEditClueError("Please enter a clue.");
    } else if (selectedClue) {
      selectedClue.text = trimmed;
      setShowEditDialog(false);
    }
  }

  function handleClueClicked(event: MouseEvent, clue: Clue) {
    event.preventDefault();
    if (onClueClicked) {
      onClueClicked(clue);
    }
  }

  return (
    <>
      <div className="clue-list">
        <h3 className="clue-list-title">{title}</h3>
        <ol style={{ listStyleType: "none" }}>
          {clues.map((c, index) => (
            <li key={index}>
              <a
                href="#"
                className={
                  c == selectedClue ? "clue-item-selected" : "clue-item"
                }
                onClick={(e) => c != selectedClue && handleClueClicked(e, c)}
              >
                <span className="clue-number">{c.number}</span>
                <span dangerouslySetInnerHTML={{ __html: c.text }}></span>
              </a>
              {c == selectedClue && (
                <IconButton
                  size="small"
                  color="primary"
                  component="span"
                  title="Edit Clue"
                  className="ms-2"
                  onClick={() => {
                    setEditClueError(undefined);
                    setEditClueText(selectedClue.getRawText());
                    setShowEditDialog(true);
                  }}
                >
                  <Edit />
                </IconButton>
              )}
            </li>
          ))}
        </ol>
      </div>
      <Dialog open={showEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Clue</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => setEditClueText(e.target.value)}
            value={editClueText}
            error={editClueError != undefined}
            helperText={editClueError}
            fullWidth
            multiline
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={saveClueEdits}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
