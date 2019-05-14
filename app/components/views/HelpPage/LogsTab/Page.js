import { FormattedMessage as T } from "react-intl";
import "style/Logs.less";

const Logs = ({
  showFnodLogs,
  showFnowalletLogs,
  onShowFnodLogs,
  onShowFnowalletLogs,
  onHideFnodLogs,
  onHideFnowalletLogs,
  fnodLogs,
  fnowalletLogs,
  isDaemonRemote,
  isDaemonStarted,
  walletReady,
  foneroLogs,
  showFoneroLogs,
  onShowFoneroLogs,
  onHideFoneroLogs,
}
) => (
  <Aux>
    <div className="tabbed-page-subtitle"><T id="logs.subtitle" m="System Logs"/></div>
    {!isDaemonRemote && isDaemonStarted ?
      !showFnodLogs ?
        <div className="log-area hidden">
          <div className="log-area-title hidden" onClick={onShowFnodLogs}>
            <T id="help.logs.fnod" m="fnod" />
          </div>
        </div>:
        <div className="log-area expanded">
          <div className="log-area-title expanded" onClick={onHideFnodLogs}>
            <T id="help.logs.fnod" m="fnod" />
          </div>
          <div className="log-area-logs">
            <textarea rows="30" value={fnodLogs} disabled />
          </div>
        </div> :
      <div/>
    }
    {!walletReady ? null : !showFnowalletLogs ?
      <div className="log-area hidden">
        <div className="log-area-title hidden" onClick={onShowFnowalletLogs}>
          <T id="help.logs.fnowallet" m="fnowallet" />
        </div>
      </div>:
      <div className="log-area expanded">
        <div className="log-area-title expanded" onClick={onHideFnowalletLogs}>
          <T id="help.logs.fnowallet" m="fnowallet" />
        </div>
        <div className="log-area-logs">
          <textarea rows="30" value={fnowalletLogs} disabled />
        </div>
      </div>
    }
    {!showFoneroLogs ?
      <div className="log-area hidden">
        <div className="log-area-title hidden" onClick={onShowFoneroLogs}>
          <T id="help.logs.fonero" m="fonero" />
        </div>
      </div>:
      <div className="log-area expanded">
        <div className="log-area-title expanded" onClick={onHideFoneroLogs}>
          <T id="help.logs.fonero" m="fonero" />
        </div>
        <div className="log-area-logs">
          <textarea rows="30" value={foneroLogs} disabled />
        </div>
      </div>
    }
  </Aux>
);

export default Logs;
