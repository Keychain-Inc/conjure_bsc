import { useWeb3React } from "@web3-react/core";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { injected } from "../lib/connectors";

export default function useEagerConnect() {
  const cookies = parseCookies();

  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (cookies.eagerConnect) {
      (async () => {
        const isAuthorized = await injected.isAuthorized();

        if (isAuthorized) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      })();
    } else {
      setTried(true);
    }
  }, []); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

