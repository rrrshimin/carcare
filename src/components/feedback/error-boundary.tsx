import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons/primary-button';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Future: send to crash-reporting service
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  private handleRestart = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-[#0C111F] px-6">
          <Text className="text-lg font-semibold text-white">
            Something went wrong
          </Text>
          <Text className="mt-2 text-center text-sm text-[#A3ACBF]">
            An unexpected error occurred. Tap below to restart the app.
          </Text>
          <PrimaryButton
            className="mt-6 w-full"
            label="Restart"
            onPress={this.handleRestart}
          />
        </View>
      );
    }

    return this.props.children;
  }
}
