/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import * as t from "../../types";
import { useNavigate } from "react-router";
import Recoil from "recoil";
import { Split } from "../layout";
import {
  Pane,
  Heading,
  Button,
  TextInputField,
  toaster,
  Strong,
  Text,
  Select,
  majorScale,
  Badge,
  Link,
  TagInput,
  Paragraph,
  TextInput,
  IconButton,
  SelectMenu,
} from "evergreen-ui";
import { currentPlatformState, idTokenState } from "../../state/app";
import { useFetch, useFormation } from "../../hooks";
import api from "../../api";
import * as yup from "yup";
import {
  SceneLayout,
  SelectList,
  EnvironmentVariableForm,
  GridBoxSelect,
  GitHubSourceSearch,
  StackConfigForm,
  WizardProgress,
} from "../ui";
import { HiArrowLeft, HiArrowRight, HiOutlineDuplicate } from "react-icons/hi";
import { getDefaultStackConfig } from "../stacks/defaults";

type Step =
  | "name-tags-language"
  | "type-provider-service"
  | "domain"
  | "source"
  | "source-review"
  | "config"
  | "review";

type State = {
  language: t.Language | null;
  service: t.CloudService | null;
  provider: t.CloudProvider | null;
  type: t.ExobaseService | null;
  step: Step;
  config: t.ServiceConfig | null;
  name: string | null;
  source: null | t.ServiceSource;
  domain: Omit<t.ServiceDomainConfig, "fqd"> | null;
  tags: string[];
};

export default function CreateServiceScene() {
  const navigate = useNavigate();
  const idToken = Recoil.useRecoilValue(idTokenState);
  const currentPlatform = Recoil.useRecoilValue(currentPlatformState);
  const createServiceRequest = useFetch(api.services.create);
  const [state, setState] = useState<State>({
    step: "name-tags-language",
    language: null,
    service: null,
    provider: null,
    type: null,
    config: null,
    source: null,
    name: null,
    domain: null,
    tags: [],
  });

  const stackKey =
    `${state.type}:${state.provider}:${state.service}` as t.StackKey;

  const handleNameTagsLanguage = (data: {
    name: string;
    tags: string[];
    language: t.Language;
  }) => {
    setState({
      ...state,
      ...data,
      step: "type-provider-service",
    });
  };

  const handleTypeProviderService = (data: {
    type: t.ExobaseService;
    provider: t.CloudProvider;
    service: t.CloudService;
  }) => {
    setState({
      ...state,
      ...data,
      step: "domain",
    });
  };

  const handleSource = (source: t.ServiceSource) => {
    setState({ ...state, source, step: "config" });
  };

  const handleConfig = (config: t.ServiceConfig) => {
    setState({ ...state, config, step: "review" });
  };

  const handleDomain = (domain: Omit<t.ServiceDomainConfig, "fqd">) => {
    const nextStep: Step = !!state.source ? "source-review" : "source";
    setState({ ...state, domain, step: nextStep });
  };

  const submit = async () => {
    if (!currentPlatform) return;

    const { error } = await createServiceRequest.fetch(
      {
        name: state.name!,
        tags: state.tags,
        source: state.source!,
        service: state.service!,
        language: state.language!,
        type: state.type as any,
        provider: state.provider!,
        config: state.config!,
        domain: state.domain as t.ServiceDomainConfig,
      },
      { token: idToken! }
    );

    if (error) {
      console.error(error);
      toaster.danger(error.details);
      return;
    }

    navigate("/services");
  };

  const cancel = () => {
    navigate("/services");
  };

  const setStep = (step: Step) => () => {
    setState({ ...state, step });
  };

  const title = (() => {
    if (state.step === "name-tags-language") return "Create New Service";
    return `Create ${state.name} Service`;
  })();

  const subtitle = (() => {
    if (state.step === "name-tags-language")
      return `
        Create a new service in the ${currentPlatform?.name} platform.
        Add tags to help you organize services in the dashboard.
      `;
    if (state.step === "type-provider-service") {
      return `
        What are you building and how do you want to deploy it?
      `;
    }
    if (state.step === "domain") {
      return `
        This step is optional. If you do not specify a domain 
        the cloud provider/service will provide one after the
        service is deployed.
      `;
    }
    if (state.step === "source" || state.step === "source-review") {
      return `
        Exobase needs a GitHub repository to use as the source. You 
        can link us to a public repository or connect to GitHub to 
        select a private repository.
      `;
    }
    if (state.step === "config") {
      return `
        We've set default values for your cloud provider/service. You can
        expand the advanced section and customize if needed.
      `;
    }
    if (state.step === "review") {
      return `
        Double check that all is ok. Confirming will not deploy your service.
        You can deploy with one click after it is created.
      `;
    }
    return "";
  })();

  return (
    <SceneLayout subtitle="Create Service">
      <Pane
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        paddingBottom={majorScale(4)}
      >
        <Pane maxWidth="500px" flex={1}>
          <Pane>
            <Heading size={800}>{title}</Heading>
            <Paragraph>{subtitle}</Paragraph>
          </Pane>
          <WizardProgress
            marginY={majorScale(2)}
            steps={["init", "type", "domain", "source", "config", "confirm"]}
            current={(() => {
              if (state.step === "name-tags-language") return "init";
              if (state.step === "type-provider-service") return "type";
              if (state.step === "domain") return "domain";
              if (state.step === "source") return "source";
              if (state.step === "source-review") return "source";
              if (state.step === "config") return "config";
              if (state.step === "review") return "confirm";
              return "confirm";
            })()}
          />
          {state.step === "name-tags-language" && (
            <ServiceNameTagsLanguageForm
              onBack={cancel}
              onSubmit={handleNameTagsLanguage}
            />
          )}
          {state.step === "type-provider-service" && (
            <TypeProviderServiceForm
              onSubmit={handleTypeProviderService}
              onBack={setStep("name-tags-language")}
            />
          )}
          {state.step === "domain" && (
            <ServiceDomainForm
              initDomain={state.domain}
              platform={currentPlatform!}
              provider={state.provider!}
              onSubmit={handleDomain}
              onSkip={setStep("source")}
              onBack={setStep("type-provider-service")}
            />
          )}
          {state.step === "source" && (
            <RepositorySourceForm
              idToken={idToken ?? ""}
              platform={currentPlatform!}
              onSubmit={handleSource}
              onBack={setStep("domain")}
            />
          )}
          {state.step === "source-review" && (
            <RepositoryReview
              source={state.source!}
              onChange={setStep("source")}
              onNext={setStep("config")}
              onBack={setStep("domain")}
            />
          )}
          {state.step === "config" && (
            <ServiceConfigForm
              initConfig={state.config}
              platform={currentPlatform}
              serviceName={state.name!}
              stack={stackKey}
              onBack={setStep("source-review")}
              onSubmit={handleConfig}
            />
          )}
          {state.step === "review" && (
            <ServiceReviewForm
              loading={createServiceRequest.loading}
              state={state}
              onSubmit={submit}
              onBack={setStep("config")}
            />
          )}
        </Pane>
      </Pane>
    </SceneLayout>
  );
}

function ServiceReviewForm({
  state,
  loading = false,
  onSubmit,
  onBack,
}: {
  state: State;
  loading?: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const url =
    state.domain &&
    (state.domain.subdomain === ""
      ? `https://${state.domain.domain}`
      : `https://${state.domain?.subdomain}.${state.domain?.domain}`);
  return (
    <>
      <Pane marginTop={majorScale(2)}>
        <Heading size={700}>{state.name}</Heading>
        <Paragraph>
          A {state.language} {state.type} running on {state.provider}{" "}
          {state.service}.
        </Paragraph>
        <Pane>
          {state.tags.map((tag) => (
            <Badge key={tag} marginRight={majorScale(1)}>
              {tag}
            </Badge>
          ))}
        </Pane>
        {url && (
          <Pane marginTop={majorScale(4)}>
            <Heading marginBottom={majorScale(1)}>Domain</Heading>
            <Link href={url}>{url}</Link>
          </Pane>
        )}
        <Pane marginTop={majorScale(4)}>
          <Heading marginBottom={majorScale(1)}>Source</Heading>
          <SelectList
            items={[
              {
                id: "selected",
                label: `${state.source?.owner}/${state.source?.repo}`,
                subtitle: state.source?.branch,
                link: `https://github.com/${state.source?.owner}/${state.source?.repo}`,
                selectable: false,
              },
            ]}
          />
        </Pane>
        {state.config?.environmentVariables &&
          state.config.environmentVariables.length > 0 && (
            <Pane marginTop={majorScale(4)}>
              <Heading marginBottom={majorScale(1)}>
                Environment Variables
              </Heading>
              <EnvironmentVariableForm
                disabled
                hideSecrets
                hideHeader
                values={state.config.environmentVariables}
              />
            </Pane>
          )}
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton onClick={onSubmit} isLoading={loading}>
          create
        </NextButton>
      </Split>
    </>
  );
}

function ServiceNameTagsLanguageForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: {
    name: string;
    tags: string[];
    language: t.Language;
  }) => void;
  onBack: () => void;
}) {
  const [language, setLanguage] = useState<t.Language>("typescript");
  const [tags, setTags] = useState<string[]>([]);
  const form = useFormation(
    {
      name: yup.string().required(),
    },
    {
      name: "",
    }
  );

  const handleSubmit = (formData: { name: string }) => {
    onSubmit({ name: formData.name, tags, language });
  };

  return (
    <>
      <Pane width="100%" marginTop={majorScale(2)}>
        <TextInputField
          label="Name"
          placeholder="Auth"
          validationMessage={form.errors.name?.message}
          {...form.register("name")}
        />
        <Pane marginTop={majorScale(4)}>
          <Pane>
            <Text>Tags</Text>
          </Pane>
          <TagInput
            width="100%"
            marginTop={majorScale(1)}
            inputProps={{
              placeholder: "Add tags...",
            }}
            values={tags}
            onChange={setTags}
          />
        </Pane>
        <Pane marginTop={majorScale(4)}>
          <Pane>
            <Text>Language</Text>
          </Pane>
          <GridBoxSelect<t.Language>
            marginTop={majorScale(2)}
            selected={language}
            onSelect={setLanguage}
            choices={[
              {
                label: "Javascript",
                key: "javascript",
                comingSoon: true,
              },
              {
                label: "Typescript",
                key: "typescript",
              },
              {
                label: "Python",
                key: "python",
                comingSoon: true,
              },
              {
                label: "Swift",
                key: "swift",
                comingSoon: true,
              },
            ]}
          />
        </Pane>
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack}>cancel</BackButton>
        </Pane>
        <NextButton onClick={form.createHandler(handleSubmit)} />
      </Split>
    </>
  );
}

const RepositoryReview = ({
  source,
  onChange,
  onNext,
  onBack,
}: {
  source: t.ServiceSource;
  onChange?: () => void;
  onNext?: () => void;
  onBack?: () => void;
}) => {
  return (
    <>
      <SelectList
        items={[
          {
            id: "selected",
            label: `${source.owner}/${source.repo}`,
            subtitle: source.branch,
            link: `https://github.com/${source.owner}/${source.repo}`,
            selectLabel: "change",
            selectAppearance: "minimal",
          },
        ]}
        onSelect={onChange}
      />
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton onClick={onNext} />
      </Split>
    </>
  );
};

function RepositorySourceForm({
  platform,
  idToken,
  onSubmit,
  onBack,
}: {
  platform: t.Platform;
  idToken: string;
  onSubmit: (source: t.ServiceSource) => void;
  onBack: () => void;
}) {
  return (
    <Pane marginTop={majorScale(2)}>
      <GitHubSourceSearch
        platform={platform}
        idToken={idToken}
        onSubmit={onSubmit}
      />
      <Split marginTop={majorScale(4)}>
        <BackButton onClick={onBack} />
      </Split>
    </Pane>
  );
}

const TypeProviderServiceForm = ({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: {
    type: t.ExobaseService;
    provider: t.CloudProvider;
    service: t.CloudService;
  }) => void;
  onBack: () => void;
}) => {
  const [state, setState] = useState<{
    type: t.ExobaseService;
    provider: t.CloudProvider;
    service: t.CloudService;
  }>({
    type: "api",
    provider: "aws",
    service: "lambda",
  });
  const update = (key: "type" | "provider" | "service") => (value: any) => {
    setState({ ...state, [key]: value });
  };
  const PROVIDER_SERVICE_TYPE = {
    aws: {
      api: [
        {
          key: "lambda",
          label: "Lambda",
        },
        {
          key: "ec2",
          label: "EC2",
          comingSoon: true,
        },
        {
          key: "ecs",
          label: "ECS",
          comingSoon: true,
        },
      ],
      "websocket-server": [
        {
          key: "lambda",
          label: "Lambda",
        },
        {
          key: "ecs",
          label: "ECS",
        },
        {
          key: "ec2",
          label: "EC2",
        },
      ],
      "static-website": [
        {
          key: "s3",
          label: "S3",
        },
        {
          key: "ec2",
          label: "EC2",
          comingSoon: true,
        },
      ],
      "task-runner": [
        {
          key: "code-build",
          label: "Code Build",
        },
      ],
    },
  } as any as Record<
    t.CloudProvider,
    Record<
      t.ExobaseService,
      { key: t.CloudService; label: string; comingSoon?: boolean }[]
    >
  >;
  const serviceChoices = PROVIDER_SERVICE_TYPE[state.provider][state.type];
  return (
    <Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>What type of web service are you building?</Heading>
        <GridBoxSelect<t.ExobaseService>
          marginTop={majorScale(2)}
          onSelect={update("type")}
          selected={state.type}
          choices={[
            {
              label: "Static Website",
              key: "static-website",
            },
            {
              label: "API",
              key: "api",
            },
            {
              label: "Task Runner",
              key: "task-runner",
            },
            {
              label: "Websocket Server",
              key: "websocket-server",
              comingSoon: true,
            },
            {
              label: "App",
              key: "app",
              comingSoon: true,
            },
          ]}
        />
      </Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>Where do you want to host it?</Heading>
        <GridBoxSelect<t.CloudProvider>
          marginTop={majorScale(2)}
          onSelect={update("provider")}
          selected={state.provider}
          choices={[
            {
              label: "AWS",
              key: "aws",
            },
            {
              label: "GCP",
              key: "gcp",
              comingSoon: true,
            },
            {
              label: "Azure",
              key: "azure",
              comingSoon: true,
            },
            {
              label: "Vercel",
              key: "vercel",
              comingSoon: true,
            },
          ]}
        />
      </Pane>
      <Pane marginTop={majorScale(4)}>
        <Heading>What service do you want to run it on?</Heading>
        <GridBoxSelect<t.CloudService>
          marginTop={majorScale(2)}
          selected={state.service}
          onSelect={update("service")}
          choices={serviceChoices}
        />
      </Pane>
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton onClick={() => onSubmit(state)} />
      </Split>
    </Pane>
  );
};

const ServiceConfigForm = ({
  initConfig,
  platform,
  serviceName,
  stack,
  onSubmit,
  onBack,
}: {
  initConfig: t.ServiceConfig | null;
  platform: t.Platform | null;
  serviceName: string;
  stack: t.StackKey;
  onSubmit: (config: t.ServiceConfig) => void;
  onBack: () => void;
}) => {
  const [envVars, setEnvVars] = useState<t.EnvironmentVariable[]>(
    initConfig?.environmentVariables ?? []
  );
  const [stackConfig, setStackConfig] = useState<{
    config: t.AnyStackConfig | null;
    isValid: boolean;
  }>({
    config: initConfig?.stack ?? getDefaultStackConfig(stack) ?? null,
    isValid: true, // Assuming that the default config set deeper down is initally valid
  });

  const config: t.ServiceConfig = {
    type: stack,
    environmentVariables: envVars,
    stack: stackConfig.config as any,
  };

  const copyServiceConfig = (serviceId: string) => {
    const service = platform?.services.find(s => s.id === serviceId)
    if (!service) return
    onSubmit(service.config)
  }

  return (
    <Pane>
      <Pane>
        <SelectMenu
          title="Select Service"
          options={
            platform?.services.filter(s => s.config.stack.stack === stack).map(s => ({ label: s.name, value: s.id })) ?? []
          }
          onSelect={(item) => copyServiceConfig(item.value as string)}
        >
          <Button iconBefore={<HiOutlineDuplicate />}>
            Copy Existing
          </Button>
        </SelectMenu>
      </Pane>
      <StackConfigForm
        value={config}
        platformName={platform?.name ?? ''}
        serviceName={serviceName}
        stack={stack}
        onStackConfigChange={setStackConfig}
        onEnvVarChange={setEnvVars}
      />
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <NextButton
          disabled={!stackConfig.isValid}
          onClick={() => onSubmit(config)}
        />
      </Split>
    </Pane>
  );
};

const ServiceDomainForm = ({
  initDomain,
  platform,
  provider,
  onSubmit,
  onSkip,
  onBack,
}: {
  initDomain: Omit<t.ServiceDomainConfig, "fqd"> | null;
  platform: t.Platform;
  provider: t.CloudProvider;
  onSubmit: (domain: Omit<t.ServiceDomainConfig, "fqd">) => void;
  onSkip?: () => void;
  onBack?: () => void;
}) => {
  const [domain, setDomain] = useState(initDomain ? initDomain.domain : "");
  const subdomainForm = useFormation<{ subdomain: string }>(
    initDomain
      ? {
          subdomain: initDomain.subdomain,
        }
      : {
          subdomain: "",
        }
  );

  const handleSubmit = () => {
    onSubmit({
      domain,
      subdomain: subdomainForm.watch().subdomain,
    });
  };

  const domains = platform.domains.filter((d) => d.provider === provider);

  const canSubmit = (() => {
    if (!domain) return false;
    if (domain === "") return false;
    if (domain === "_none_selected") return false;
    return true;
  })();

  return (
    <Pane marginTop={majorScale(4)}>
      {domains.length > 0 && (
        <Pane>
          <Heading marginBottom={majorScale(1)}>Domain</Heading>
          <Split alignItems="flex-end">
            <TextInput
              placeholder="dev"
              {...subdomainForm.register("subdomain")}
            />
            <Pane marginX={majorScale(1)}>
              <Strong>.</Strong>
            </Pane>
            <Select
              value={domain || "_none_selected"}
              onChange={(e: any) => setDomain(e.target.value)}
            >
              <option value="_none_selected">Select Domain</option>
              {domains.map((d) => (
                <option key={d.domain} value={d.domain}>
                  {d.domain}
                </option>
              ))}
            </Select>
          </Split>
        </Pane>
      )}
      {domains.length === 0 && (
        <Paragraph>
          There are no domains configured for the {provider} cloud provider. You
          can configure one and return or continue without a custom domain. A
          custom domain can always be added or changed to a running service.
        </Paragraph>
      )}
      <Split marginTop={majorScale(4)}>
        <Pane flex={1}>
          <BackButton onClick={onBack} />
        </Pane>
        <Button
          appearance="minimal"
          onClick={onSkip}
          marginRight={majorScale(1)}
        >
          skip
        </Button>
        <NextButton onClick={handleSubmit} disabled={!canSubmit} />
      </Split>
    </Pane>
  );
};

const BackButton = ((props: any) => {
  return (
    <Button
      appearance="minimal"
      iconBefore={<HiArrowLeft size={12} />}
      {...props}
    >
      {props.children ? props.children : "back"}
    </Button>
  );
}) as typeof Button;

const NextButton = ((props: any) => {
  return (
    <Button
      appearance="primary"
      iconAfter={<HiArrowRight size={12} />}
      {...props}
    >
      {props.children ? props.children : "next"}
    </Button>
  );
}) as typeof Button;
