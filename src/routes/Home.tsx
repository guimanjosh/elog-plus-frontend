import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutlet,
  useSearchParams,
} from "react-router-dom";
import { twJoin } from "tailwind-merge";
import Filters, { Filters as FiltersObject } from "../components/Filters";
import Navbar from "../components/Navbar";
import useEntries from "../hooks/useEntries";
import useIsSmallScreen from "../hooks/useIsSmallScreen";
import { EntryQuery } from "../hooks/useEntries";
import InfoDialogButton from "../components/InfoDialogButton";
import EntryListGrouped from "../components/EntryListGrouped";
import serializeParams, { ParamsObject } from "../utils/serializeParams";

const DEFAULT_QUERY: EntryQuery = {
  logbooks: [],
  tags: [],
  requireAllTags: false,
  startDate: null,
  endDate: null,
  search: "",
  sortByLogDate: false,
  onlyFavorites: false,
};

const MIN_PANE_WIDTH = 384;

function deserializeQuery(params: URLSearchParams): EntryQuery {
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  return {
    logbooks: params.get("logbooks")?.split(",") ?? DEFAULT_QUERY.logbooks,
    tags: params.get("tags")?.split(",") ?? DEFAULT_QUERY.tags,
    requireAllTags: params.has("requireAllTags"),
    startDate: startDate ? new Date(startDate) : DEFAULT_QUERY.startDate,
    endDate: endDate ? new Date(endDate) : DEFAULT_QUERY.endDate,
    search: params.get("search") ?? DEFAULT_QUERY.search,
    sortByLogDate: params.has("sortByLogDate"),
    onlyFavorites: params.has("onlyFavorites"),
  };
}

export default function Home() {
  const isSmallScreen = useIsSmallScreen();
  const bodyRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  // Although the spotlight state in stored in the location state,
  // this is used if the spotlighted entry is not loaded and thus needs to be
  // fetched.
  const [spotlightSearch, setSpotlightSearch] = useState<string | undefined>(
    undefined
  );
  const query = useMemo(() => deserializeQuery(searchParams), [searchParams]);
  const location = useLocation();
  const navigate = useNavigate();

  const setQuery = useCallback(
    (query: EntryQuery, preserveState = false) => {
      setSearchParams(serializeParams(query as ParamsObject), {
        replace: true,
        state: preserveState ? location.state : undefined,
      });
    },
    [location.state, setSearchParams]
  );

  const { isLoading, entries, getMoreEntries, reachedBottom } = useEntries({
    query,
    spotlight: spotlightSearch,
  });

  const spotlight = location.state?.spotlight;

  // This is used when the user uses spotlight but the spotlighted entry is not
  // already loaded. When this happens, we go into a state of "spotlight search"
  // where this function is then used to back into the normal state.
  const backToTop = useCallback(() => {
    setSpotlightSearch(undefined);
    // Delete state
    navigate({ search: window.location.search }, { replace: true });
  }, [navigate]);

  // Ensure the spotlighted element is loaded and if not set, setSpotlightSearch
  // to spotlight
  useEffect(() => {
    if (
      spotlightSearch !== spotlight &&
      entries !== undefined &&
      !entries.some((entry) => entry.id === spotlight) &&
      // `spotlight` must truthy because if the user goes into spotlight search,
      // then clicks the spotlight is removed (either by clicking on an entry
      // or any other means of navigation), we want to stay in the spotlight
      // search state.
      spotlight
    ) {
      setSpotlightSearch(spotlight);
      if (spotlight) {
        setQuery(DEFAULT_QUERY, true);
      }
    }
  }, [entries, spotlight, setQuery, spotlightSearch]);

  function onFiltersChange(filters: FiltersObject) {
    if (query.logbooks.join(",") !== filters.logbooks.join(",")) {
      filters.tags = [];
    }
    setQuery({ ...query, ...filters });
  }

  function onSearchChange(search: string) {
    setQuery({ ...query, search });
  }

  const outlet = useOutlet();

  const mouseMoveHandler = useCallback((e: MouseEvent) => {
    if (bodyRef.current && gutterRef.current) {
      const gutterRect = gutterRef.current.getBoundingClientRect();
      bodyRef.current.style.flexBasis =
        Math.max(e.clientX - gutterRect.width / 2, MIN_PANE_WIDTH) + "px";
    }
  }, []);

  const endDrag = useCallback(() => {
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", endDrag);
  }, [mouseMoveHandler]);

  const startDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", endDrag);
    },
    [mouseMoveHandler, endDrag]
  );

  return (
    <div className="h-screen flex flex-col">
      <div
        className={twJoin(
          "p-3 shadow z-10 relative",
          // Padding for the absolutely positioned info button
          !isSmallScreen && "px-12"
        )}
      >
        <div className="container m-auto">
          <Navbar
            className="mb-1"
            search={query.search}
            onSearchChange={onSearchChange}
          />

          <InfoDialogButton />
          <Filters filters={query} setFilters={onFiltersChange} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <EntryListGrouped
          containerClassName={twJoin(
            "w-1/2",
            (!outlet || isSmallScreen) && "flex-1"
          )}
          ref={bodyRef}
          entries={entries || []}
          emptyLabel="No entries found"
          selected={location.pathname.split("/")[1]}
          isLoading={isLoading}
          logbooksIncluded={query.logbooks}
          showReferences
          showFollowUps
          allowFavorite
          allowFollowUp
          allowSupersede
          allowSpotlightForFollowUps
          onBottomVisible={reachedBottom ? undefined : getMoreEntries}
          dateBasedOn={query.sortByLogDate ? "loggedAt" : "eventAt"}
          spotlight={spotlight}
          showBackToTopButton={Boolean(spotlightSearch)}
          onBackToTop={backToTop}
        />
        {outlet && (
          <>
            {!isSmallScreen && (
              <div
                className="relative border-r cursor-col-resize select-text"
                onMouseDown={startDrag}
                ref={gutterRef}
              >
                {/* We specifically want the handle/gutter to lean more right 
                than left, because we don't want overlay it above the the scroll 
                bar for the entry list */}
                <div className="absolute -left-1 w-4 h-full select-text" />
              </div>
            )}
            <div
              className={twJoin(
                "overflow-y-auto pb-3",
                !isSmallScreen && "flex-1 flex-shrink"
              )}
              style={{ minWidth: isSmallScreen ? "auto" : MIN_PANE_WIDTH }}
            >
              {outlet}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
