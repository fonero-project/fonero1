import { KeyBlueButton } from "buttons";
import { ShowError } from "shared";
import { FormattedMessage as T } from "react-intl";
import { getFnodLastLogLine, getFnowalletLastLogLine } from "wallet";
import ReactTimeout from "react-timeout";
import "style/GetStarted.less";

function parseLogLine(line) {
  const res = /^[\d :\-.]+ \[...\] (.+)$/.exec(line);
  return res ? res[1] : "";
}

const LastLogLinesFragment = ({ lastFnodLogLine, lastFnowalletLogLine }) => (
  <div className="get-started-last-log-lines">
    <div className="last-fnod-log-line">{lastFnodLogLine}</div>
    <div className="last-fnowallet-log-line">{lastFnowalletLogLine}</div>
  </div>
);

const StartupErrorFragment = ({ onRetryStartRPC }) => (
  <div className="advanced-page-form">
    <div className="advanced-daemon-row">
      <ShowError className="get-started-error" error="Connection to fnod failed, please try and reconnect." />
    </div>
    <div className="loader-bar-buttons">
      <KeyBlueButton className="get-started-rpc-retry-button" onClick={onRetryStartRPC}>
        <T id="getStarted.retryBtn" m="Retry" />
      </KeyBlueButton>
    </div>
  </div>
);

@autobind
class StartRPCBody extends React.Component {

  constructor(props) {
    super(props);
    this.state = { lastFnodLogLine: "", lastFnowalletLogLine: "" };
  }

  componentDidMount() {
    this.props.setInterval(() => {
      Promise
        .all([ getFnodLastLogLine(), getFnowalletLastLogLine() ])
        .then(([ fnodLine, fnowalletLine ]) => {
          const lastFnodLogLine = parseLogLine(fnodLine);
          const lastFnowalletLogLine = parseLogLine(fnowalletLine);
          if ( lastFnodLogLine !== this.state.lastFnodLogLine ||
              lastFnowalletLogLine !== this.state.lastFnowalletLogLine)
          {
            this.setState({ lastFnodLogLine, lastFnowalletLogLine });
          }
        });
    }, 2000);
  }

  render () {
    const { startupError, getCurrentBlockCount } = this.props;

    return (
      <Aux>
        {!getCurrentBlockCount && <LastLogLinesFragment {...this.state} />}
        {startupError && <StartupErrorFragment {...this.props} />}
      </Aux>
    );
  }
}

export default ReactTimeout(StartRPCBody);
