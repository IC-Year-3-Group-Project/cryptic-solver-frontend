export interface HideProps {
  if: boolean;
  children: any;
}

export default function Hide(props: HideProps) {
  return (
    <div style={props.if ? { display: "none" } : {}}>
      {props.children}
    </div>
  );
}
