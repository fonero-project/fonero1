import Logs from "./Page";
import { getFnodLogs, getFnowalletLogs, getFoneroLogs } from "wallet";
import { logging } from "connectors";
import { DescriptionHeader } from "layout";
import { FormattedMessage as T } from "react-intl";
import ReactTimeout from "react-timeout";

export const LogsTabHeader = () =>
  <DescriptionHeader
    description={<T id="help.description.logs" m="Please find your current logs below to look for any issue or error you are having." />}
  />;
@autobind
class LogsTabBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  componentDidMount() {
    this.getLogs();
  }

  componentDidUpdate() {
    if(this.state.interval) {
      return;
    }
    const interval = this.props.setInterval(() => {
      this.getLogs();
    }, 2000);
    this.setState({ interval });
  }

  componentWillUnmount() {
    this.props.clearInterval(this.state.interval);
  }

  getInitialState() {
    return {
      interval: null,
      fnodLogs: "",
      fnowalletLogs: "",
      foneroLogs: "",
      showFnodLogs: false,
      showFnowalletLogs: false,
      showFoneroLogs: false
    };
  }

  render() {
    const { onShowFoneroLogs, onShowFnodLogs, onShowFnowalletLogs,
      onHideFoneroLogs, onHideFnodLogs, onHideFnowalletLogs
    } = this;
    return (
      <Logs
        {...{
          ...this.props,
          ...this.state,
          onShowFoneroLogs,
          onShowFnodLogs,
          onShowFnowalletLogs,
          onHideFoneroLogs,
          onHideFnodLogs,
          onHideFnowalletLogs,
        }}
      />
    );
  }

  getLogs() {
    return Promise
      .all([ getFnodLogs(), getFnowalletLogs(), getFoneroLogs() ])
      .then(([ rawFnodLogs, rawFnowalletLogs, foneroLogs ]) => {
        const fnodLogs = Buffer.from(rawFnodLogs).toString("utf8");
        const fnowalletLogs = Buffer.from(rawFnowalletLogs).toString("utf8");
        if ( fnodLogs !== this.state.fnodLogs ) {
          this.setState({ fnodLogs });
        }
        if ( fnowalletLogs !== this.state.fnowalletLogs ) {
          this.setState({ fnowalletLogs });
        }
        if ( foneroLogs !== this.state.foneroLogs ) {
          this.setState({ foneroLogs });
        }
      });
  }

  onShowFoneroLogs() {
    this.setState({ showFoneroLogs: true });
  }

  onHideFoneroLogs() {
    this.setState({ showFoneroLogs: false });
  }

  onShowFnodLogs() {
    this.setState({ showFnodLogs: true });
  }

  onHideFnodLogs() {
    this.setState({ showFnodLogs: false });
  }

  onShowFnowalletLogs() {
    this.setState({ showFnowalletLogs: true });
  }

  onHideFnowalletLogs() {
    this.setState({ showFnowalletLogs: false });
  }
}

export const LogsTab = ReactTimeout(logging(LogsTabBody));
