import { Web3ReactProvider } from "@web3-react/core";
import Nav from "../components/nav";
import BottomNav from "../components/bottom_nav";
import App from "next/app";
import getLibrary from "../lib/getLibrary";
import "../styles/tailwind.css";

// min-w-0 min-h-0 bg-gradient-to-r from-teal-400 to-blue-600
function ConjureApp({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <div className="flex min-h-screen flex-col bg-purple-200">
        <Nav />

        <div className="flex-auto ">
          <Component {...pageProps} />
        </div>

          <BottomNav />
      </div>

    </Web3ReactProvider>
  );
}

ConjureApp.getInitialProps = async (appContext) => ({
  ...(await App.getInitialProps(appContext)),
});

export default ConjureApp;
