# Tasks
Tasks is a not so creatively named application for managing a task list.

## Introduction

### The Problem
The challenge with contemporary task list applications is they are either:

* Bloated with features that aren't necessary, resulting in a cluttered user interface and bad experience, or
* Too minimalistic, leaving the user without useful functionality

### Project Objective
The aim of this project is to create a task list manager that:

* Provides the user (only) the features they need
* Offers automations to make managing tasks easier
* Allows common/routine operations to be executed via keyboard shortcuts
* Provides a minimalist/streamlined user interface

## Features
In addition to the basics (i.e., creating and completing tasks), Tasks implements a number features to boost productivity.

### Task Management
By design, Tasks supports only one task list. This means users cannot, for example, create lists for Personal, Office, Grocery, etc. Tasks does, however, provide several other options for managing your task list.

#### Pinned Tasks
Pinned tasks always appear at the top of your task list.
> [!TIP]
> Pinned tasks can be helpful to users that want to regularly track of long running (weeks to months) tasks.

#### Flagged Tasks
Flagging a task changes the task color, making it more noticeable.
> [!TIP]
> Flags are useful for drawing attention to high priority tasks.

#### Completed Tasks
Completed tasks are, naturally, those tasks that are marked as complete. A unique feature of Tasks is that completed tasks are ephemeral. To relieve users from having to repeatedly cull completed tasks, Tasks will only retain a set, but configurable, number of completed tasks.

Automatic completed task culling is first in, first out (FIFO). For example, if the user configures Tasks to retain 20 completed tasks, when a 21st task is completed, the 1st completed task will be purged.

> [!WARNING]
> When purged, completed tasks do *not* go to the Trash, they are immediately and permanently deleted. Users worried about losing historic tasks should assign a high number to the **Number of completed task to retain** value in Settings.

#### Snoozed Tasks
Traditional task management applications often turn into extensive lists that require constant tending to. In particular:
* Task lists can get prohibitively long, cluttered, and overwhelming
* Features, like due dates, can be a useful, but often become a management burden

Snoozed tasks can help mitigate these challenges by allowing users to (temporarily) clear less immediate tasks from the working task list. Since tasks are snoozed on interval (e.g., 2 days, 5 days, 2 weeks, etc.), users do not have to manage specific calendar dates.

#### Trash
Unsurprisingly, manually deleted tasks (included completed tasks) go to the Trash. Perhaps unique to Tasks, deleted tasks, like completed tasks, are ephemeral. To relieve users from having to empty or remove items from the Trash, Tasks will automatically remove (i.e., permanently delete) items from the Trash when the number of tasks in the Trash reach a set, but configurable, number. Like completed task culling, Trash culling is FIFO.

#### Task Ordering/Reordering
Task ordering is important for prioritizing and maintaining focus. In Tasks, pinned and unpinned tasks can be reordered via drag and drop.

> [!NOTE]
> Due to Tasks automated culling features, which purge tasks using a FIFO method, neither completed or deleted tasks can be reordered via drag and drop. Similarly, snoozed tasks, which inherently have a "natural" relative order based on the length of time before a snoozed task "wakes up," cannot be reordered via drag and drop.

#### Notes
Each task can have associated notes. The editor supports ordered and unordered lists, as well as bold, italics, and underline font decoration.

#### Light and Dark Themes
Tasks has two themes: light and dark.

> [!NOTE]
> There is no setting for manually selecting light and dark modes. Tasks will automatically theme/re-theme based on the user's system's Appearance setting.

### Keyboard Shortcuts
Per the tables below, Tasks provides application-wide keyboard shortcuts as well as keyboard shortcuts specific to the task page.

#### Global Shortcuts

| Shortcut         | Action                     |
|------------------|----------------------------|
| esc              | Perform context aware action |
| ⌘ N              | Add task                   |
| ⌘ ⇧ S            | Open Snoozed               |
| ⌘ ⇧ T            | Open Trash                 |
| ⌘ ,              | Open Settings              |

> [!NOTE]
> The esc key action is based on context. When viewing Snoozed, Trash, or Settings, esc will return the user to the Tasks page. When on the Tasks page, esc will close the  sidebar (if visible and the Tasks Sidebar setting is set to "Open on double click") or set cursor focus to the "Add tasks" input box.

#### Tasks Shortcuts

| Shortcut          | Action               |
|-------------------|----------------------|
| ⌘ ⇧ P            | Toggle pin           |
| ⌘ ⇧ O            | Toggle completed      |
| ⌘ ⌫              | Delete task          |
| ⌘ ⇧ [            | Previous task        |
| ⌘ ⇧ ]            | Next task            |

### Mobile Support and Syncing Across Devices
Tasks does **not** support mobile or sync data across devices. These features are not a important to me but I may add them in the future as I recognize there importance to some.

## To Dos
* Mature software distribution. At the moment, the best/only way to get Tasks is to clone this repo and build your own version. Once feature development has stabilized, I'll package a release.
* Add URL support in the notes text editor.
* Add option for placing the sidebar on the left-hand side.

## Known Issues
The Download Tasks feature (in Settings) was used to aid in migrating tasks between development versions of the app. It is, at best, half-baked. It:
* Does not produce well formatted JSON (this will be fixed)
* Includes the rich text formatting present in task notes (it is not clear if this is the "correct" behavior and will require more thought to determine what should, or should not, be done).

## Disclaimers
* This software is beta.
* Tasks was made with Electron using HTML, CSS, and JavaScript only. It should work on any platform. That said, Tasks was designed, developed, and tested exclusively on MacOS.

## Thank you
* [Ariel Diaz](https://github.com/fullmetalbrackets) - For offering a solid HEX to CSS filter [conversion tool](https://cssfiltergenerator.lol/)
* [Tabler](https://tabler.io/) - For offering free and awesome [icons](https://tabler.io/icons)
* [SVGator](https://www.svgator.com/) - For providing a nice tool for editing svg files.