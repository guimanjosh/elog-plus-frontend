import { useLoaderData, useNavigate } from "react-router-dom";
import EntryForm from "../components/EntryForm";
import Pane from "../components/Pane";
import { Entry } from "../api";

export default function FollowUp() {
  const navigate = useNavigate();

  const entry = useLoaderData() as Entry;

  return (
    <Pane>
      <EntryForm
        followingUp={entry}
        onEntryCreated={(entryId) =>
          navigate({ pathname: `/${entryId}`, search: window.location.search })
        }
      />
    </Pane>
  );
}
