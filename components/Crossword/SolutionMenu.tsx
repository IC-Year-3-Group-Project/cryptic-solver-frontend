import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Solution, stripSolution } from "./utils";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export interface SolutionMenuProps {
  solutions?: Solution[];
  anchor?: HTMLElement | null;
  currentText?: string;
  onSolutionSelected: (solution?: Solution) => void;
}

export function SolutionMenu(props: SolutionMenuProps) {
  const [explainSolution, setExplainSolution] = useState<Solution>();

  function createDiffedSolution(solution: string) {
    let reduced = 0;
    return (
      <>
        {[...solution].map((c, index) => {
          if (/[^A-z]/g.test(c)) {
            reduced++;
            return (
              <span
                dangerouslySetInnerHTML={{ __html: c.replace(" ", "&nbsp;") }}
              ></span>
            );
          }

          if (
            !props.currentText ||
            props.currentText[index - reduced] == "_" ||
            props.currentText[index - reduced].toLowerCase() == c.toLowerCase()
          ) {
            return c;
          } else {
            return (
              <span key={index} style={{ color: "red" }}>
                {c}
              </span>
            );
          }
        })}
        <span style={{ marginRight: "0.5rem" }}></span>
      </>
    );
  }

  return props.anchor ? (
    <>
      <Menu anchorEl={props.anchor} open={props.solutions != undefined}>
        {props.solutions
          ?.sort((s0, s1) => s1.confidence - s0.confidence)
          .map((solution, index) => [
            <MenuItem
              key={index}
              onClick={() => props.onSolutionSelected(solution)}
            >
              {createDiffedSolution(solution.answer)} (
              {Math.round(1000 * solution.confidence) / 10}
              %)
            </MenuItem>,

            <Button
              sx={{
                display: "flex",
                margin: "auto",
                height: "1rem",
                width: "100%",
              }}
              size="small"
              onClick={(event) => {
                setExplainSolution(solution);
              }}
            >
              Explain ?
            </Button>,

            props.solutions && index == props.solutions.length - 1 ? (
              <MenuItem
                key={index + 1}
                onClick={() => props.onSolutionSelected()}
              >
                None
              </MenuItem>
            ) : null,
          ])}
      </Menu>
      <Dialog open={explainSolution != undefined}>
        <DialogTitle>Explanation of '{explainSolution?.answer}'</DialogTitle>
        <DialogContent>
          <Typography>{explainSolution?.explanation}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExplainSolution(undefined)} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  ) : null;
}
