import * as React from 'react'
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export interface IncomingArguments {
  buttonText?: string
  buttonStyles?: any
  buttonTextStyles?: any
  containerStyles?: any
  messageStyles?: any
  messageText?: string
  position?: string
  positionOffset?: number
}

export interface IMergedProps {
  [key: string]: any
  connected: boolean
  setupNetworkRetry: (onRetry: () => any) => any
  hideNetworkToast: () => any
}

export interface State {
  connected: boolean
  modalVisible: boolean
  message: string
  buttonText: string
  onRetry?: any
  positionValue?: any
}

export const withNetwork = (incomingArgs: IncomingArguments = {}) => (
  WrappedComponent: any
) =>
  class C extends React.PureComponent<any, State> {
    unsubscribeNetworkListener: any
    state: State

    constructor(props: any) {
      super(props)
      this.state = {
        connected: true,
        modalVisible: true,
        message: 'No Connection',
        buttonText: 'RETRY',
        onRetry: null,
        positionValue: new Animated.Value(-100),
      }
    }

    componentDidMount() {
      this.unsubscribeNetworkListener = NetInfo.addEventListener(
        (state: any) => {
          this.setState({ connected: state.isConnected })
          if (!state.isConnected) {
            this._showToast()
          }
        }
      )
    }

    componentWillUnmount() {
      this.unsubscribeNetworkListener && this.unsubscribeNetworkListener()
    }

    renderToastMessage() {
      return (
        <Animated.View style={this._getContainerStyle()}>
          <View style={this._getToastStyles()}>
            <Text numberOfLines={1} style={this._getMessageTextStyles()}>
              {this._getMessageText()}
            </Text>
            <TouchableOpacity onPress={this._handleRetryButton}>
              <View style={this._getButtonStyles()}>
                <Text style={this._getButtonTextStyles()}>
                  {this._getButtonText()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )
    }

    render() {
      const { connected, modalVisible } = this.state

      const mergedProps: IMergedProps = {
        ...this.props,
        connected,
        setupNetworkRetry: this._setOnRetryBtn,
        hideNetworkToast: this._hideToast,
      }

      return (
        <View style={styles.root}>
          <WrappedComponent {...mergedProps} />
          {!modalVisible ? null : this.renderToastMessage()}
        </View>
      )
    }

    _setOnRetryBtn = (onRetry: () => any) => {
      this.setState({
        onRetry,
      })
    }

    _getModalStatus = () => this.state.modalVisible

    _showToast = () => {
      const { position, positionOffset } = incomingArgs
      let customValue = 0
      if (position) {
        customValue = position === 'top' ? 30 : 0
      }
      if (positionOffset) {
        customValue = positionOffset
      }
      this.setState({
        modalVisible: true,
      })
      Animated.timing(this.state.positionValue, {
        toValue: customValue,
        duration: 400,
      }).start()
    }

    _hideToast = () => {
      if (this._getModalStatus()) {
        Animated.timing(this.state.positionValue, {
          toValue: -100,
          duration: 400,
        }).start(this._closeModal.bind(this))
      }
    }

    _closeModal = () => {
      this.setState({
        modalVisible: false,
      })
      const { onRetry } = this.state
      if (onRetry && typeof onRetry === 'function') {
        onRetry()
      }
    }

    _handleRetryButton = () => {
      const { connected } = this.state
      if (!connected) {
        return
      }
      this._hideToast()
    }

    _getMessageText = () => {
      const { messageText } = incomingArgs
      const { message } = this.state
      if (!messageText) {
        return message
      }
      return messageText
    }

    _getButtonText = () => {
      const { buttonText } = incomingArgs
      if (!buttonText || typeof buttonText !== 'string') {
        return this.state.buttonText
      }
      return buttonText.toUpperCase()
    }

    _getContainerStyle = () => {
      const { positionValue } = this.state
      let incomingArg = 'bottom'
      const { position } = incomingArgs
      if (position) {
        incomingArg = position
      }
      return {
        ...styles.defaultContainerStyle,
        bottom: incomingArg === 'top' ? undefined : positionValue,
        top: incomingArg === 'top' ? positionValue : undefined,
      }
    }

    _getToastStyles = () => {
      const { containerStyles } = incomingArgs
      let incomingStyles = {}
      if (containerStyles) {
        incomingStyles = containerStyles
      }
      return {
        ...styles.defaultToastStyle,
        ...incomingStyles,
      }
    }

    _getMessageTextStyles = () => {
      const { messageStyles } = incomingArgs
      let incomingStyles = {}
      if (messageStyles) {
        incomingStyles = messageStyles
      }
      return {
        ...styles.messageText,
        ...incomingStyles,
      }
    }

    _getButtonStyles = () => {
      const { buttonStyles } = incomingArgs
      let incomingStyles = {}
      if (buttonStyles) {
        incomingStyles = buttonStyles
      }
      return {
        ...styles.defaultButtonStyle,
        ...incomingStyles,
      }
    }

    _getButtonTextStyles = () => {
      const { buttonTextStyles } = incomingArgs
      let incomingStyles = {}
      if (buttonTextStyles) {
        incomingStyles = buttonTextStyles
      }
      return {
        ...styles.defaultButtonTextStyle,
        ...incomingStyles,
      }
    }
  }

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
  },
  defaultContainerStyle: {
    position: 'absolute',
    opacity: 1,
    width: '100%',
    elevation: 0,
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 0,
  },
  defaultToastStyle: {
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    minHeight: 50,
  },
  defaultButtonStyle: {
    backgroundColor: 'rgba(50, 50, 50, 0.001)',
    padding: 10,
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  defaultButtonTextStyle: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
