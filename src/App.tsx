import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatInterface } from './components/chat/ChatInterface';
import { ModelSwitcher } from './components/controls/ModelSwitcher';
import { ParameterPanel } from './components/controls/ParameterPanel';
import { ExperimentLog } from './components/experiments/ExperimentLog';
import { ComparisonView } from './components/experiments/ComparisonView';
import { useOllama } from './hooks/useOllama';
import { useExperimentStore, useSelectedExperiments } from './hooks/useExperiments';
import { ModelParameters, PresetType, PARAMETER_PRESETS } from './types';
import { MODELS } from './lib/model-registry';
import { Card, CardHeader, CardContent } from './components/ui/Card';

type ViewType = 'chat' | 'experiments' | 'compare';

const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
};

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [activePreset, setActivePreset] = useState<PresetType | null>('balanced');

  const {
    messages,
    isStreaming,
    streamingContent,
    error,
    isConnected,
    localModels,
    sendMessage,
    stopGeneration,
    clearMessages,
    checkOllamaConnection,
  } = useOllama({
    model: selectedModel,
    parameters,
  });

  const experiments = useExperimentStore((s) => s.experiments);
  const selectedIds = useExperimentStore((s) => s.selectedIds);
  const selectExperiment = useExperimentStore((s) => s.selectExperiment);
  const toggleCompare = useExperimentStore((s) => s.toggleCompare);
  const clearSelection = useExperimentStore((s) => s.clearSelection);
  const selectedExperiments = useSelectedExperiments();

  useEffect(() => {
    checkOllamaConnection();
    const interval = setInterval(checkOllamaConnection, 30000);
    return () => clearInterval(interval);
  }, [checkOllamaConnection]);

  const handlePresetChange = (preset: PresetType) => {
    setActivePreset(preset);
    setParameters((prev) => ({
      ...prev,
      ...PARAMETER_PRESETS[preset],
    }));
  };

  const handleParameterChange = (newParams: ModelParameters) => {
    setParameters(newParams);
    setActivePreset(null);
  };

  const handleCompare = () => {
    setCurrentView('compare');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header isConnected={isConnected} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          experimentCount={experiments.length}
          comparisonCount={selectedIds.length}
        />

        <main className="flex-1 flex overflow-hidden">
          {currentView === 'chat' && (
            <>
              {/* Chat area */}
              <div className="flex-1 flex flex-col min-w-0">
                <ChatInterface
                  messages={messages}
                  isStreaming={isStreaming}
                  streamingContent={streamingContent}
                  error={error}
                  isConnected={isConnected}
                  modelName={MODELS.find(m => m.id === selectedModel)?.displayName}
                  onSend={sendMessage}
                  onStop={stopGeneration}
                  onClear={clearMessages}
                />
              </div>

              {/* Controls sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-80 border-l border-slate-200 bg-white overflow-y-auto"
              >
                <div className="p-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-slate-900">Model Selection</h3>
                    </CardHeader>
                    <CardContent>
                      <ModelSwitcher
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        localModels={localModels}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-slate-900">Parameters</h3>
                    </CardHeader>
                    <CardContent>
                      <ParameterPanel
                        parameters={parameters}
                        onChange={handleParameterChange}
                        activePreset={activePreset}
                        onPresetChange={handlePresetChange}
                      />
                    </CardContent>
                  </Card>
                </div>
              </motion.aside>
            </>
          )}

          {currentView === 'experiments' && (
            <div className="flex-1">
              <ExperimentLog
                experiments={experiments}
                selectedIds={selectedIds}
                onSelectExperiment={selectExperiment}
                onToggleCompare={toggleCompare}
                onCompare={handleCompare}
              />
            </div>
          )}

          {currentView === 'compare' && (
            <div className="flex-1">
              <ComparisonView
                experiments={selectedExperiments}
                onClose={() => {
                  clearSelection();
                  setCurrentView('experiments');
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
