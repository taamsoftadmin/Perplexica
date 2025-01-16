import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { CloudUpload, RefreshCcw, RefreshCw } from 'lucide-react';
import React, {
  Fragment,
  useEffect,
  useState,
  type SelectHTMLAttributes,
} from 'react';
import ThemeSwitcher from './theme/Switcher';

const CUSTOM_OPENAI_MODELS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-4o', label: 'GPT-4 Omni' },
  { value: 'gpt-4o-mini', label: 'GPT-4 Omni Mini' },
] as const;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({ className, ...restProps }: InputProps) => {
  return (
    <input
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    />
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = ({ className, options, ...restProps }: SelectProps) => {
  return (
    <select
      {...restProps}
      className={cn(
        'bg-light-secondary dark:bg-dark-secondary px-3 py-2 flex items-center overflow-hidden border border-light-200 dark:border-dark-200 dark:text-white rounded-lg text-sm',
        className,
      )}
    >
      {options.map(({ label, value, disabled }) => {
        return (
          <option key={value} value={value} disabled={disabled}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

interface SettingsType {
  chatModelProviders: {
    [key: string]: [Record<string, any>];
  };
  embeddingModelProviders: {
    [key: string]: [Record<string, any>];
  };
  openaiApiKey: string;
  groqApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  ollamaApiUrl: string;
}

// Helper components for better organization
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium text-black/90 dark:text-white/90 mb-4 mt-6 border-b border-light-200 dark:border-dark-200 pb-2">
    {children}
  </h3>
);

const SettingItem = ({
  label,
  description,
  children,
  className,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)}>
    <label className="text-sm font-medium text-black/70 dark:text-white/70">
      {label}
    </label>
    {description && (
      <p className="text-xs text-black/50 dark:text-white/50 mb-1">
        {description}
      </p>
    )}
    {children}
  </div>
);

const SettingsDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const [config, setConfig] = useState<SettingsType | null>(null);
  const [chatModels, setChatModels] = useState<Record<string, any>>({});
  const [embeddingModels, setEmbeddingModels] = useState<Record<string, any>>(
    {},
  );
  const [selectedChatModelProvider, setSelectedChatModelProvider] = useState<
    string | null
  >(null);
  const [selectedChatModel, setSelectedChatModel] = useState<string | null>(
    null,
  );
  const [selectedEmbeddingModelProvider, setSelectedEmbeddingModelProvider] =
    useState<string | null>(null);
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState<
    string | null
  >(null);
  const [customOpenAIApiKey, setCustomOpenAIApiKey] = useState<string>('');
  const [customOpenAIBaseURL, setCustomOpenAIBaseURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = (await res.json()) as SettingsType;
        setConfig(data);

        const chatModelProvidersKeys = Object.keys(
          data.chatModelProviders || {},
        );
        const embeddingModelProvidersKeys = Object.keys(
          data.embeddingModelProviders || {},
        );

        const defaultChatModelProvider =
          chatModelProvidersKeys.length > 0 ? chatModelProvidersKeys[0] : '';
        const defaultEmbeddingModelProvider =
          embeddingModelProvidersKeys.length > 0
            ? embeddingModelProvidersKeys[0]
            : '';

        const chatModelProvider =
          localStorage.getItem('chatModelProvider') ||
          defaultChatModelProvider ||
          '';
        const chatModel =
          localStorage.getItem('chatModel') ||
          (data.chatModelProviders &&
          data.chatModelProviders[chatModelProvider]?.length > 0
            ? data.chatModelProviders[chatModelProvider][0].name
            : undefined) ||
          '';
        const embeddingModelProvider =
          localStorage.getItem('embeddingModelProvider') ||
          defaultEmbeddingModelProvider ||
          '';
        const embeddingModel =
          localStorage.getItem('embeddingModel') ||
          (data.embeddingModelProviders &&
            data.embeddingModelProviders[embeddingModelProvider]?.[0].name) ||
          '';

        setSelectedChatModelProvider(chatModelProvider);
        setSelectedChatModel(chatModel);
        setSelectedEmbeddingModelProvider(embeddingModelProvider);
        setSelectedEmbeddingModel(embeddingModel);
        setCustomOpenAIApiKey(localStorage.getItem('openAIApiKey') || '');
        setCustomOpenAIBaseURL(localStorage.getItem('openAIBaseURL') || '');
        setChatModels(data.chatModelProviders || {});
        setEmbeddingModels(data.embeddingModelProviders || {});
        setIsLoading(false);
      };

      fetchConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsUpdating(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      localStorage.setItem('chatModelProvider', selectedChatModelProvider!);
      localStorage.setItem('chatModel', selectedChatModel!);
      localStorage.setItem(
        'embeddingModelProvider',
        selectedEmbeddingModelProvider!,
      );
      localStorage.setItem('embeddingModel', selectedEmbeddingModel!);
      localStorage.setItem('openAIApiKey', customOpenAIApiKey!);
      localStorage.setItem('openAIBaseURL', customOpenAIBaseURL!);
    } catch (err) {
      console.log(err);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);

      window.location.reload();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40 backdrop-blur-sm" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-secondary border border-light-200 dark:border-dark-200 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="text-2xl font-semibold text-black dark:text-white mb-2">
                  Settings
                </DialogTitle>
                
                {config && !isLoading ? (
                  <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <SectionHeader>Appearance</SectionHeader>
                    <SettingItem 
                      label="Theme"
                      description="Choose your preferred color theme"
                    >
                      <ThemeSwitcher />
                    </SettingItem>

                    <SectionHeader>AI Models</SectionHeader>
                    {config.chatModelProviders && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingItem 
                          label="Chat Model Provider"
                          description="Select your AI chat model provider"
                        >
                          <Select
                            value={selectedChatModelProvider ?? undefined}
                            onChange={(e) => {
                              setSelectedChatModelProvider(e.target.value);
                              if (e.target.value === 'custom_openai') {
                                setSelectedChatModel('');
                              } else {
                                setSelectedChatModel(
                                  config.chatModelProviders[e.target.value][0].name,
                                );
                              }
                            }}
                            className="w-full"
                            options={Object.keys(config.chatModelProviders).map(
                              (provider) => ({
                                value: provider,
                                label: provider.charAt(0).toUpperCase() + provider.slice(1),
                              }),
                            )}
                          />
                        </SettingItem>

                        {selectedChatModelProvider && selectedChatModelProvider !== 'custom_openai' && (
                          <SettingItem 
                            label="Chat Model"
                            description="Choose the specific model to use"
                          >
                            <Select
                              value={selectedChatModel ?? undefined}
                              onChange={(e) => setSelectedChatModel(e.target.value)}
                              className="w-full"
                              options={(() => {
                                const chatModelProvider =
                                  config.chatModelProviders[
                                    selectedChatModelProvider
                                  ];

                                return chatModelProvider
                                  ? chatModelProvider.length > 0
                                    ? chatModelProvider.map((model) => ({
                                        value: model.name,
                                        label: model.displayName,
                                      }))
                                    : [
                                        {
                                          value: '',
                                          label: 'No models available',
                                          disabled: true,
                                        },
                                      ]
                                  : [
                                      {
                                        value: '',
                                        label:
                                          'Invalid provider, please check backend logs',
                                        disabled: true,
                                      },
                                    ];
                              })()}
                            />
                          </SettingItem>
                        )}
                      </div>
                    )}

                    {selectedChatModelProvider === 'custom_openai' && (
                      <div className="space-y-4 border rounded-lg p-4 bg-light-secondary/50 dark:bg-dark-200/50">
                        <SettingItem 
                          label="Custom Model Name"
                          description="Select or enter an OpenAI model identifier"
                        >
                          <div className="flex flex-col space-y-2">
                            <Select
                              value={selectedChatModel ?? undefined}
                              onChange={(e) => setSelectedChatModel(e.target.value)}
                              className="w-full"
                              options={[
                                { value: '', label: 'Select a model' },
                                ...CUSTOM_OPENAI_MODELS,
                                { value: 'custom', label: 'Custom model name' }
                              ]}
                            />
                            {selectedChatModel === 'custom' && (
                              <Input
                                type="text"
                                placeholder="Enter custom model name"
                                onChange={(e) => setSelectedChatModel(e.target.value)}
                                className="mt-2"
                              />
                            )}
                          </div>
                        </SettingItem>
                        
                        <SettingItem 
                          label="Custom API Key"
                          description="Your OpenAI API key for custom endpoint"
                        >
                          <Input
                            type="password"
                            placeholder="sk-..."
                            defaultValue={customOpenAIApiKey!}
                            onChange={(e) => setCustomOpenAIApiKey(e.target.value)}
                          />
                        </SettingItem>
                        <SettingItem 
                          label="Base URL"
                          description="Custom OpenAI API endpoint URL"
                        >
                          <Input
                            type="text"
                            placeholder="https://api.openai.com/v1"
                            defaultValue={customOpenAIBaseURL!}
                            onChange={(e) => setCustomOpenAIBaseURL(e.target.value)}
                          />
                        </SettingItem>
                      </div>
                    )}

                    <div className="mt-6">
                      <SettingItem 
                        label="Embedding Model Provider"
                        description="Select provider for text embeddings"
                      >
                        <Select
                          value={selectedEmbeddingModelProvider ?? undefined}
                          onChange={(e) => {
                            setSelectedEmbeddingModelProvider(e.target.value);
                            setSelectedEmbeddingModel(
                              config.embeddingModelProviders[e.target.value][0].name,
                            );
                          }}
                          className="w-full"
                          options={Object.keys(
                            config.embeddingModelProviders,
                          ).map((provider) => ({
                            label:
                              provider.charAt(0).toUpperCase() +
                              provider.slice(1),
                            value: provider,
                          }))}
                        />
                      </SettingItem>

                      {selectedEmbeddingModelProvider && (
                        <SettingItem 
                          label="Embedding Model"
                          description="Choose the specific embedding model"
                        >
                          <Select
                            value={selectedEmbeddingModel ?? undefined}
                            onChange={(e) => setSelectedEmbeddingModel(e.target.value)}
                            className="w-full"
                            options={(() => {
                              const embeddingModelProvider =
                                config.embeddingModelProviders[
                                  selectedEmbeddingModelProvider
                                ];

                              return embeddingModelProvider
                                ? embeddingModelProvider.length > 0
                                  ? embeddingModelProvider.map((model) => ({
                                      label: model.displayName,
                                      value: model.name,
                                    }))
                                  : [
                                      {
                                        label: 'No embedding models available',
                                        value: '',
                                        disabled: true,
                                      },
                                    ]
                                : [
                                    {
                                      label:
                                        'Invalid provider, please check backend logs',
                                      value: '',
                                      disabled: true,
                                    },
                                  ];
                            })()}
                          />
                        </SettingItem>
                      )}
                    </div>

                    <SectionHeader>API Configuration</SectionHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SettingItem 
                        label="OpenAI API Key"
                        description="Required for OpenAI models"
                      >
                        <Input
                          type="password"
                          placeholder="sk-..."
                          defaultValue={config.openaiApiKey}
                          onChange={(e) => setConfig({
                            ...config,
                            openaiApiKey: e.target.value,
                          })}
                        />
                      </SettingItem>

                      <SettingItem 
                        label="Anthropic API Key"
                        description="Required for Claude models"
                      >
                        <Input
                          type="password"
                          placeholder="sk-ant-..."
                          defaultValue={config.anthropicApiKey}
                          onChange={(e) => setConfig({
                            ...config,
                            anthropicApiKey: e.target.value,
                          })}
                        />
                      </SettingItem>

                      <SettingItem 
                        label="GROQ API Key"
                        description="Required for GROQ models"
                      >
                        <Input
                          type="password"
                          placeholder="gsk-..."
                          defaultValue={config.groqApiKey}
                          onChange={(e) => setConfig({
                            ...config,
                            groqApiKey: e.target.value,
                          })}
                        />
                      </SettingItem>

                      <SettingItem 
                        label="Gemini API Key"
                        description="Required for Google models"
                      >
                        <Input
                          type="password"
                          placeholder="API key"
                          defaultValue={config.geminiApiKey}
                          onChange={(e) => setConfig({
                            ...config,
                            geminiApiKey: e.target.value,
                          })}
                        />
                      </SettingItem>

                      <SettingItem 
                        label="Ollama API URL"
                        description="URL for local Ollama instance"
                        className="md:col-span-2"
                      >
                        <Input
                          type="text"
                          placeholder="http://localhost:11434"
                          defaultValue={config.ollamaApiUrl}
                          onChange={(e) => setConfig({
                            ...config,
                            ollamaApiUrl: e.target.value,
                          })}
                        />
                      </SettingItem>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-light-200 dark:border-dark-200 pt-4">
                      <p className="text-xs text-black/50 dark:text-white/50">
                        Changes will take effect after page refresh
                      </p>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading || isUpdating}
                        className="bg-[#24A0ED] flex items-center space-x-2 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CloudUpload size={18} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center mt-6 text-black/70 dark:text-white/70 py-6">
                    <RefreshCcw className="animate-spin" />
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsDialog;
