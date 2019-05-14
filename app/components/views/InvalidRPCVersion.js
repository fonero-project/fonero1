// @flow
import { FormattedMessage as T } from "react-intl";
import { invalidRPCVersion } from "connectors";
import { StandalonePageBody } from "layout";

const InvalidRPCVersion = ({ requiredWalletRPCVersion, walletRPCVersion }) => (
  <StandalonePageBody>
    <div className="invalid-rpc-info">
      <T
        id="invalidRPCVersion.info"
        m={`The API of the currently running wallet ({walletRPCVersion}) is not compatible with Fonero (required version {requiredWalletRPCVersion}).

        Please update the daemon (fnod) and wallet (fnowallet) to the latest version, then try again.`}
        values={{ walletRPCVersion, requiredWalletRPCVersion }}
      />
    </div>
  </StandalonePageBody>
);

InvalidRPCVersion.propTypes = {
  requiredWalletRPCVersion: PropTypes.string.isRequired,
  walletRPCVersion: PropTypes.string.isRequired
};

export default invalidRPCVersion(InvalidRPCVersion);
