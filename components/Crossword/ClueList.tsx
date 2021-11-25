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
import { List, ListItem, Typography } from "@mui/material";

export interface ClueListProps {
  title: string;
  clues: Clue[];
  selectedClue?: Clue;
  onClueClicked?: (clue: Clue) => void;
  explainAnswer: (clue: Clue) => string;
}

export default function ClueList(props: ClueListProps) {
  const { title, clues, onClueClicked, selectedClue, explainAnswer } = props;

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
        <List>
          {clues.map((c, index) => (
            <ListItem key={index} sx={{ mt: 1 }}>
              <a
                href="#"
                className={
                  c == selectedClue ? "clue-item-selected" : "clue-item"
                }
                onClick={(e) => c != selectedClue && handleClueClicked(e, c)}
              >
                {c == selectedClue && (
                  <Typography
                    sx={{ fontWeight: "bold", mb: 0, mt: 1, ml: 1 }}
                    variant="h6"
                    noWrap
                  >
                    {c.number}. {c.text}
                    <IconButton
                      sx={{ ml: 0.5 }}
                      size="small"
                      color="primary"
                      component="span"
                      title="Edit Clue"
                      onClick={() => {
                        setEditClueError(undefined);
                        setEditClueText(selectedClue.getRawText());
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <Typography variant="body1" sx={{ ml: 2 }}>
                      {explainAnswer(c)}
                    </Typography>
                  </Typography>
                )}
                {c != selectedClue && (
                  <Typography sx={{ mb: 0, mt: 1, ml: 1 }} variant="h6" noWrap>
                    {c.number}. {c.text}
                  </Typography>
                )}
              </a>
            </ListItem>
          ))}
        </List>
      </div>
      <Dialog open={showEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Clue</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
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
