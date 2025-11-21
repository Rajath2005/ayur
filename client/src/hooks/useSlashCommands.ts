import { useState, useCallback } from "react";

interface SlashCommand {
    command: string;
    description: string;
    action: () => void;
}

interface UseSlashCommandsProps {
    onClear?: () => void;
    onHelp?: () => void;
    onTip?: () => void;
}

const AYURVEDIC_TIPS = [
    "Start your day with warm water and lemon to stimulate digestion.",
    "Practice oil pulling with coconut or sesame oil for oral health.",
    "Eat your largest meal at midday when digestive fire is strongest.",
    "Include all six tastes in your meals: sweet, sour, salty, pungent, bitter, and astringent.",
    "Practice abhyanga (self-massage) with warm oil before bathing.",
    "Go to bed before 10 PM to align with natural circadian rhythms.",
    "Meditate for at least 10 minutes daily to calm the mind.",
    "Use turmeric in your cooking for its anti-inflammatory properties.",
    "Drink warm herbal teas throughout the day instead of cold beverages.",
    "Practice mindful eating without distractions.",
];

export function useSlashCommands({ onClear, onHelp, onTip }: UseSlashCommandsProps = {}) {
    const [showCommandMenu, setShowCommandMenu] = useState(false);

    const commands: SlashCommand[] = [
        {
            command: "/clear",
            description: "Clear the current conversation",
            action: () => {
                onClear?.();
            },
        },
        {
            command: "/help",
            description: "Show available commands",
            action: () => {
                onHelp?.();
            },
        },
        {
            command: "/tip",
            description: "Get a random Ayurvedic wellness tip",
            action: () => {
                onTip?.();
            },
        },
    ];

    const getRandomTip = useCallback(() => {
        return AYURVEDIC_TIPS[Math.floor(Math.random() * AYURVEDIC_TIPS.length)];
    }, []);

    const processCommand = useCallback(
        (input: string): { isCommand: boolean; shouldClear: boolean } => {
            const trimmed = input.trim();

            if (!trimmed.startsWith("/")) {
                return { isCommand: false, shouldClear: false };
            }

            const command = commands.find((cmd) => trimmed === cmd.command);

            if (command) {
                command.action();
                return { isCommand: true, shouldClear: true };
            }

            return { isCommand: false, shouldClear: false };
        },
        [commands]
    );

    const getSuggestions = useCallback(
        (input: string): SlashCommand[] => {
            if (!input.startsWith("/")) {
                return [];
            }

            const query = input.toLowerCase();
            return commands.filter((cmd) => cmd.command.toLowerCase().startsWith(query));
        },
        [commands]
    );

    return {
        commands,
        processCommand,
        getSuggestions,
        showCommandMenu,
        setShowCommandMenu,
        getRandomTip,
    };
}
