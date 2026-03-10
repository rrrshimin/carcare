Style Guide
Purpose

This document defines the visual style and UI design principles for the CarCare Diary mobile application.

It ensures that all UI elements follow a consistent visual language and that AI coding tools such as Cursor or Codex generate interfaces that match the intended design system.

The style guide covers:

colors

typography

spacing

layout

components

icon usage

UI states

Design Philosophy

The design language of CarCare Diary should feel:

clean

focused

technical

dark-mode first

minimal but structured

The interface should emphasize clarity and readability, especially when displaying maintenance data.

The UI should avoid visual noise and excessive decoration.

Color System

The application uses a dark theme with a strong blue accent color.

Primary Brand Color
#0051E8

Usage:

primary buttons

active elements

highlights

brand accents

important call-to-action actions

Example uses:

Add button

Continue button

Selected UI state

Background Color
#0C111F

Usage:

main screen background

app base layout

This color establishes the dark theme.

Link / Secondary Accent Color
#367DFF

Usage:

text links

text buttons

interactive labels

inline actions

Example:

"New Log"

"Share"

"Stop Sharing"

Suggested Neutral Colors

These are recommended to complete the palette.

Card Background
#141A2B

Usage:

cards

category containers

log rows

Border Color
#1F2740

Usage:

input borders

card outlines

separators

Primary Text
#FFFFFF

Usage:

titles

main content text

Secondary Text
#A3ACBF

Usage:

descriptions

metadata

labels

helper text

Warning Color

Recommended for service warnings:

#FFB020

Usage:

warning icon

due-soon maintenance items

Typography
Font Family

The app uses:

Poppins

This font should be used across the entire application.

Font Weights
Title Weight
ExtraBold

Usage:

screen titles

major section headings

vehicle name

Body Text
Regular

Usage:

descriptions

log entries

metadata

labels

Typography Scale

Recommended scale:

Style	Size	Weight
Page Title	28	ExtraBold
Section Title	20	ExtraBold
Card Title	18	ExtraBold
Body Text	16	Regular
Secondary Text	14	Regular
Caption	12	Regular
Layout System

The app should follow a consistent spacing system.

Recommended base spacing unit:

8px

Spacing scale:

Token	Value
xs	4
sm	8
md	16
lg	24
xl	32

Example usage:

card padding: 16

section spacing: 24

screen margin: 16

Border Radius

Use soft rounded corners.

Recommended values:

Element	Radius
Buttons	10
Cards	14
Inputs	10
Images	14
Shadows

Since the UI uses a dark theme, shadows should be subtle.

Recommended shadow style:

low elevation

slight opacity

minimal blur

Cards should rely more on contrast than heavy shadows.

Icon System

Icons should be simple and consistent.

Recommended style:

line icons

minimal detail

single color

Suggested icon sets:

Lucide Icons

Feather Icons

Heroicons

Icons should inherit text color unless otherwise specified.

Buttons
Primary Button

Color:

Background: #0051E8
Text: #FFFFFF

Usage:

main actions

Add

Continue

Save

Style:

rounded corners

medium height

bold label

Text Button

Color:

Text: #367DFF

Usage:

secondary actions

inline actions

Examples:

New Log

Share

Stop Sharing

Cards

Cards are used for most structured UI elements.

Examples:

vehicle card

category card

log history items

Style:

background: #141A2B

radius: 14px

padding: 16px

minimal border

Input Fields

Inputs should follow consistent styling.

Style:

Background:

#141A2B

Border:

#1F2740

Padding:

12px – 16px

Inputs include:

text fields

number inputs

date inputs

dropdown selectors

Lists

Lists appear frequently in the app.

Examples:

maintenance items

log history

log types

List rows should include:

left icon

main label

status text

optional arrow indicator

Spacing between rows should be consistent.

Warning State

Maintenance items that are due soon should visually stand out.

Recommended elements:

warning icon

warning color

slightly elevated list position

Example:

⚠ Change in 800 km
Image Usage

Vehicle images are displayed prominently.

Guidelines:

high quality

large header format

rounded corners

Image occupies approximately top 40–50% of the home screen.

UI Framework Recommendation

To maintain consistent styling, the project should use a component styling system similar to Tailwind for React Native.

Recommended options:

NativeWind

Website:

https://www.nativewind.dev

NativeWind brings Tailwind-style utility classes to React Native.

Benefits:

consistent styling

faster UI building

easier collaboration with AI tools

predictable spacing and layout

Example:

<View className="bg-[#0C111F] p-4 rounded-xl">
Alternative: Tamagui

Another modern design system for React Native.

Website:

https://tamagui.dev

Advantages:

theme system

cross-platform design tokens

strong performance

Design Tokens

All style values should be stored as design tokens where possible.

Example structure:

src/constants/theme.ts

Example tokens:

export const colors = {
  primary: "#0051E8",
  background: "#0C111F",
  link: "#367DFF",
}
Accessibility

The UI should respect basic accessibility guidelines.

Recommendations:

minimum text size: 12px

adequate color contrast

tappable areas ≥ 44px

descriptive button labels

UI Consistency Rules

Developers and AI tools should follow these rules:

do not introduce new colors randomly

do not mix multiple fonts

maintain consistent spacing

reuse existing components before creating new ones

prefer card-based layouts

Summary

The CarCare Diary UI should be:

dark themed

clean and technical

highly readable

structured using cards and lists

built with consistent spacing and typography

powered by reusable components

Primary visual anchors:

brand blue accent (#0051E8)

dark background (#0C111F)

Poppins typography