import { MouseEvent } from "react";
import { ClueSelectionColour } from "./Crossword";
import { Clue } from "./model/Clue";

export interface ClueListProps {
  title: string;
  clues: Clue[];
  selectedClue?: Clue;
  onClueClicked?: (clue: Clue) => void;
}

export default function ClueList(props: ClueListProps) {
  const { title, clues, onClueClicked, selectedClue } = props;

  function handleClueClicked(event: MouseEvent, clue: Clue) {
    event.preventDefault();
    if (onClueClicked) {
      onClueClicked(clue);
    }
  }

  return (<div style={{display: "flex", flex: "0 0 35%", flexGrow: 0, flexShrink: 0, flexDirection: "column"}}>
    <h3 style={{paddingLeft: "1rem", paddingBottom: "0.5rem", marginLeft: "2rem", marginTop: 0, marginBottom: 0, borderBottom: "1px dotted black"}}>{title}</h3>
    <ol style={{listStyleType: "none"}}>
    {clues.map((c, index) => {
      const selected = c == selectedClue;
      return (<li key={index}>
        <a href="#" style={{lineHeight: "2rem", backgroundColor: selected ? ClueSelectionColour : undefined, fontWeight: selected ? "bold" : "normal"}}
          onClick={e => c != selectedClue && handleClueClicked(e, c)}>
          <span style={{fontWeight: "bold", width: "20px", marginRight: "10px"}}>{c.number}</span>
          <span dangerouslySetInnerHTML={{__html: c.text}}></span>
        </a>
      </li>);
    })}
    </ol>
  </div>)
}