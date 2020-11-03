import { connect } from 'react-redux'
import { getOnboardingInitiator } from '../../../selectors'
import EndOfFlow from './end-of-flow.component'

const firstTimeFlowTypeNameMap = {
  create: 'New Wallet Created',
  'import': 'New Wallet Imported',
}

const mapStateToProps = (state) => {
  const { metamask: { firstTimeFlowType } } = state

  return {
    completionMetaMetricsName: firstTimeFlowTypeNameMap[firstTimeFlowType],
    onboardingInitiator: getOnboardingInitiator(state),
  }
}

export default connect(mapStateToProps)(EndOfFlow)
