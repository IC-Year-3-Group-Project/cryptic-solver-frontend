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
import { Grid, List, ListItem, Typography } from "@mui/material";

export interface ClueListProps {
  title: string;
  clues: Clue[];
  selectedClue?: Clue;
  onClueClicked?: (clue: Clue) => void;
  explainAnswer: (clue: Clue) => string;
  getHints: (clue: Clue) => string[];
}

export default function ClueList(props: ClueListProps) {
  const { title, clues, onClueClicked, selectedClue, explainAnswer, getHints } =
    props;

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
      <Grid
        item
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        xs={6}
        md={6}
        spacing={2}
        className="clue-list"
      >
        <Grid item container>
          <Grid item xs={10}>
            <Typography variant="h5" className="clue-list-title">
              {title}
            </Typography>
          </Grid>
        </Grid>
        {clues.map((c, index) => {
          const selected = c == selectedClue;
          return (
            <Grid item key={index} ml={1.5}>
              <a href="#" onClick={(e) => !selected && handleClueClicked(e, c)}>
                <>
                  <Typography
                    sx={{
                      mb: 0,
                      mt: 1,
                      ml: 1,
                      fontWeight: selected ? "bold" : "normal",
                    }}
                    variant="body1"
                  >
                    {c.number}
                    {". "}
                    <span dangerouslySetInnerHTML={{ __html: c.text }} />
                    {selected && (
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
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {explainAnswer(c)}
                  </Typography>
                  {getHints(c)?.map((hint) => (
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {hint}
                    </Typography>
                  ))}
                </>
              </a>
            </Grid>
          );
        })}
      </Grid>
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
