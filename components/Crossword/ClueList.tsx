import { MouseEvent } from "react";
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

  return (
    <div className="clue-list">
      <h3 className="clue-list-title">{title}</h3>
      <ol style={{ listStyleType: "none" }}>
        {clues.map((c, index) => (
          <li key={index}>
            <a
              href="#"
              className={c == selectedClue ? "clue-item-selected" : "clue-item"}
              onClick={(e) => c != selectedClue && handleClueClicked(e, c)}
            >
              <span className="clue-number">{c.number}</span>
              <span dangerouslySetInnerHTML={{ __html: c.text }}></span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
