import FloatInput from "./FloatInput";
import IntegerInput from "./IntegerInput";
import { strToFnoAtoms } from "helpers/strings";
import balanceConnector from "connectors/balance";

/**
 * FixedFnoInput is a simple numeric input that is assumed to **always** hold
 * a floating point number representing a FNO amount (ie, an amount that
 * will be mutiplied by 1e8 to get to the actual atoms value).
 *
 * This is **not** affected by the global currencyDisplay state.
 *
 * Whenever possible, use the FnoInput component, as it is more flexible and
 * already manages the underlying input value in atoms.
 */
export const FixedFnoInput = ({ currencyDisplay, ...props }) =>
  <FloatInput {...{ ...props, unit: currencyDisplay, maxFracDigits: 8 }} />;

/**
 * FnoInput provides a way to receive fonero amount inputs. Instead of the usual
 * value/onChange pair, it uses amount/onChangeAmount to track values in fonero
 * atoms, correctly accounting for the currently used currencyDisplay, floating
 * convertions, etc.
 *
 * It tracks 2 different values: the typed input in the text box (which may
 * contain decimal and eventually thousands separator) and the actual input
 * amount in **ATOMS** (as required by various wallet operations).
 */
@autobind
class FnoInput extends React.Component {

  constructor(props) {
    super(props);
    this.state = { value: this.amountToDisplayStr(props.amount) };
  }

  componentDidUpdate(prevProps) {
    if (!this.props.amount && !this.state.value) {
      //ignore when emptying or setting to 0
      return;
    }

    if (this.props.amount !== prevProps.amount) {
      this.setState({ value: this.amountToDisplayStr(this.props.amount) });
    }
  }

  amountToDisplayStr(amount) {
    if (!amount) return amount;
    const { unitDivisor } = this.props;
    return amount / unitDivisor;
  }

  changeAmount(value) {
    const { unitDivisor } = this.props;
    const amount = !value ? 0 : strToFnoAtoms(value, unitDivisor);
    if (amount !== this.props.amount) {
      this.props.onChangeAmount && this.props.onChangeAmount(amount);
    }
  }

  onChange(e) {
    const value = e.target.value;
    if (value) {
      // pre-validate if <= max supply
      const { unitDivisor } = this.props;
      const amount = strToFnoAtoms(value, unitDivisor);
      // TODO: move to a global constant
      if (amount > 21e14) return;
    }

    if (value !== this.state.value) {
      this.setState({ value }, () => this.changeAmount(value));
    }
  }

  render() {
    const { unitDivisor, currencyDisplay } = this.props;
    const { value } = this.state;
    const { onChange } = this;
    const maxFracDigits = Math.log10(unitDivisor);

    const Comp = unitDivisor !== 1 ? FloatInput : IntegerInput;
    return <Comp
      {...this.props}
      unit={currencyDisplay}
      value={value}
      onChange={onChange}
      maxFracDigits={maxFracDigits}
    />;
  }
}

export default balanceConnector(FnoInput);
