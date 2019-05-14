import { FormattedMessage as T } from "react-intl";
import { HelpLink, HelpLinkInfoModal, HelpLinkAboutModal } from "buttons";
import { ConstitutionModalContent } from "modals";
import { DescriptionHeader } from "layout";
import "style/Help.less";

export const LinksTabHeader = () =>
  <DescriptionHeader
    description={<T id="help.description.links" m="If you have any difficulty with fonero, please use the following links to help find a solution." />}
  />;

export const LinksTab = () => (
  <Aux>
    <div className="tabbed-page-subtitle"><T id="help.subtitle.project" m="Project Related"/></div>
    <div className="help-icons-list">
      <HelpLink className={"help-github-icon"} href="https://github.com/fonero-project/fonero" title={<T id="help.github.title" m="Github"/>} subtitle={<T id="help.github.subtitle" m="github.com/fonero-project/fonero"/>} />
      <HelpLink className={"help-docs-icon"} href="https://docs.fonero.org" title={<T id="help.documentation" m="Documentation" />} subtitle={<T id="help.documentation.subtitle" m="docs.fonero.org"/>}/>
      <HelpLink className={"help-stakepools-icon"} href="https://fonero.org/stakepools" title={<T id="help.stakepools" m=" Stakepools" />} subtitle={<T id="help.stakepools.subtitle" m="fonero.org/stakepools"/>}/>
      <HelpLink className={"help-blockchain-explorer-icon"} href="https://explorer.fonero.org" title={<T id="help.blockchain" m=" Blockchain Explorer" />} subtitle={<T id="help.blockchain.subtitle" m="explorer.fonero.org"/>}/>
      <HelpLinkInfoModal className={"help-constitution-icon"}
        title={<T id="help.constitution" m="Constitution"/>}
        subtitle={<T id="help.constitution.subtitle" m="Fonero Project Constitution"/>}
        modalTitle={<h1><T id="help.constitution.modal.title" m="Fonero Constitution" /></h1>}
        modalContent={<ConstitutionModalContent />}
        double
      />
      <HelpLinkAboutModal className={"help-star-icon"}
        title={<T id="help.about.fonero" m="About Fonero"/>}
        subtitle={<T id="help.about.fonero.subtitle" m="Software Summary"/>}
      />
    </div>
    <div className="tabbed-page-subtitle"><T id="help.subtitle.communications" m="Communications"/></div>
    <div className="help-icons-list">
      <HelpLink className={"help-forum-icon"} href="https://bitcointalk.org/index.php?topic=4887643" title={<T id="help.forum" m="Bitcointalk ANN" />} subtitle={<T id="help.forum.subtitle" m="bitcointalk.org/index.php?..."/>}/>
      <HelpLink className={"help-discord-icon"} href="https://discordapp.com/invite/AUc79Gk" title={<T id="help.discord" m="Bitcointalk ANN" />} subtitle={<T id="help.discord.subtitle" m="discordapp.com/invite/AUc79Gk"/>}/>
      <HelpLink className={"help-telegram-icon"} href="https://t.me/fonero_en" title={<T id="help.telegram_en" m="Telegram EN" />} subtitle={<T id="help.telegram_en.subtitle" m="t.me/fonero_en"/>}/>
      <HelpLink className={"help-telegram-icon"} href="https://t.me/fonero_ru" title={<T id="help.telegram_ru" m="Telegram RU" />} subtitle={<T id="help.telegram_ru.subtitle" m="t.me/fonero_ru"/>}/>
      <HelpLink className={"help-telegram-icon"} href="https://t.me/fonero_asia" title={<T id="help.telegram_ch" m="Telegram CH" />} subtitle={<T id="help.telegram_ch.subtitle" m="t.me/fonero_asia"/>}/>
      <HelpLink className={"help-telegram-icon"} href="https://t.me/fonero_esp" title={<T id="help.telegram_es" m="Telegram ES" />} subtitle={<T id="help.telegram_es.subtitle" m="t.me/fonero_esp"/>}/>
    </div>
  </Aux>
);
