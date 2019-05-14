import Modal from "../Modal";
import { shell } from "electron";
import { FormattedMessage as T } from "react-intl";

@autobind
class AboutModal extends React.Component {
  render() {
    const { show, onCancelModal, version, updateAvailable } = this.props;
    return (
      <Modal className="about-modal" {...{ show, onCancelModal }}>
        <div className="about-modal-icon"/>
        <div className="about-modal-content">
          <div className="about-modal-title">
            <T id="aboutModal.fonero" m="Fonero" />
          </div>
          <div className="info-modal-close-button-top" onClick={onCancelModal}/>
          <div className="about-modal-text-paragraph">
            <T id="aboutModal.paragraph1" m="A cross platform GUI Wallet for Fonero written in node.js using Electron"/>
          </div>
          <div className="about-modal-text-paragraph">
            <T id="aboutModal.paragraph2a" m="Fonero is free and open source software, developed and designed by the global team of"/> <a onClick={() => shell.openExternal("http://fonero.org/contributors/")}><T id="aboutModal.paragraph2b" m="Fonero contributors"/></a>
          </div>
          <div className="about-modal-text-paragraph">
            <T id="aboutModal.paragraph3" m="Want to help or get involved, check out"/> <a onClick={() => shell.openExternal("https://github.com/fonero-project/fonero")}>github.com/fonero-project/fonero</a>
          </div>
        </div>
        <div className="about-modal-bottom-area">
          <div className="about-modal-bottom-area-left">
            <T id="aboutModal.version" m="Version"/> {version} -&nbsp;
            {updateAvailable ?
              <a className="about-modal-upgrade" onClick={() => shell.openExternal("https://github.com/fonero-project/fonero-binaries/releases")}><T id="aboutModal.upgradeAvailable" m="Upgrade Available"/></a> :
              <a className="about-modal-upgrade" onClick={() => shell.openExternal("https://github.com/fonero-project/fonero-binaries/releases/tag/v"+`${version}`)}><T id="aboutModal.whatsNew" m="What's New?"/></a> }
          </div>
          <div className="about-modal-bottom-area-middle">
            Copyright &copy; 2018 <a onClick={() => shell.openExternal("https://fonero.org")}>Fonero</a>
          </div>
          <div className="about-modal-bottom-area-right">
            <a onClick={() => shell.openExternal("https://github.com/fonero-project/fonero/blob/master/LICENSE")}><T id="aboutModal.licensing" m="Licensing information"/></a>
          </div>
        </div>
      </Modal>
    );
  }
}

export default AboutModal;
