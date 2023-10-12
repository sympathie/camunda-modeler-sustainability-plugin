# Sustainability Plugin for Modeling sustainability impact of business processes.

[![Compatible with Camunda Modeler version 5](https://img.shields.io/badge/Modeler_Version-5.0.0+-blue.svg)](#) [![Plugin Type](https://img.shields.io/badge/Plugin%20Type-BPMN-orange.svg)](#)

#### This project is developed as part of a thesis at FH Aachen - University of Applied Sciences

The Sustainability Plugin for the Camunda Modeler is an extension designed to integrate the United Nations
Sustainable Development Goals (SDGs) into the BPMN (Business Process Model and Notation). This plugin
aims to empower the modeling of sustainability impacts and contribution to the SDGs.

The plugin integrates necessary additional elements to provide the linkage between process elements and
the SDGs.


## Extended Elements

### Sustainable Development Goals

The element SDG represent the 17 goals developed by the UN and can be integrated on outer layers of the process model
namely Process and Collaboration defining the prioritized of the organization and link the importance to
the process model.

### Sustainable Development Targets

This element is part of the SDG and details the targets which the process impacts.

### Key Sustainability Indicators

This element can be fixed to Processes, Collaborations, Events, Activities, Sub-Processes, and lanes and defines the goal of the specific BPMN element or layer.
The KSIs are directly connected to the process model and define the indicators to measure the processes impact.
Examples can be CO2-Emissions, Energy-Consumption, Energy-Reduction etc.

The KSIs are connected with the specific targets of the Goal to link the impact of the process model to
the global targets of the UN.

### Sustainable Development Impact

This element is the connection between the Key Sustainability Indicators and the SDG targets. It defines which target
will be impacted by the KSI and how it will be impacted in terms of "minimizing negative impact" or "maximizing positive
impact".
Refer to the SDG Compass for further description.

### Metric

The Metric element can be an extension to all Flow Node elements and quantifies the measurement of the element based
on the related KSI. The Metric element refers to a KSI to inherit the quantification method, the measurement unit and
the threshold.

### Visualization

The impact is visualized by a Heatmap that can be dynamically adjusted based on the selected KSI. The Heatmap
uses color coding to compare the elements of the process model and visually show the elements which have the most impact
within the process.

## Development Setup

Use [npm](https://www.npmjs.com/), the [Node.js](https://nodejs.org/en/) package manager to download and install
required dependencies:

```sh
npm install
```

To make the Camunda Modeler aware of your plugin you must link the plugin to
the [Camunda Modeler plugin directory](https://github.com/camunda/camunda-modeler/tree/develop/docs/plugins#plugging-into-the-camunda-modeler)
via a symbolic link.
Available utilities to do that
are [`mklink /d`](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/mklink) on Windows
and [`ln -s`](https://linux.die.net/man/1/ln) on MacOS / Linux.

Re-start the app in order to recognize the newly linked plugin.

## Building the Plugin

You may spawn the development setup to watch source files and re-build the client plugin on changes:

```sh
npm run dev
```

Given you've setup and linked your plugin [as explained above](#development-setup), you should be able to reload the
modeler to pick up plugin changes. To do so, open the app's built in development toos via `F12`. Then, within the
development tools press the reload shortcuts `CTRL + R` or `CMD + R` to reload the app.

To prepare the plugin for release, executing all necessary steps, run:

```sh
npm run all
```

## Additional Resources

* [List of existing plugins](https://github.com/camunda/camunda-modeler-plugins)
* [Plugins documentation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/plugins/)
