// The dataset
const DATASET_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

// Set up dimensions
const WIDTH = 960;
const HEIGHT = 570;
const LEGEND_HEIGHT = 100;

// Create SVG container
const svg = d3
	.select("#treemap-container")
	.append("svg")
	.attr("width", WIDTH)
	.attr("height", HEIGHT + LEGEND_HEIGHT);

// Create tooltip
const tooltip = d3.select("#tooltip");

// Fetch and process data
d3.json(DATASET_URL)
	.then((data) => {
		// Create treemap layout
		const treemap = d3.treemap().size([WIDTH, HEIGHT]).padding(1);

		// Create root hierarchy
		const root = d3
			.hierarchy(data)
			.sum((d) => d.value)
			.sort((a, b) => b.value - a.value);

		// Generate treemap data
		treemap(root);

		// Color scale for different categories
		const colorScale = d3
			.scaleOrdinal()
			.domain(root.children.map((d) => d.data.name))
			.range(d3.schemeSet3);

		// Create tiles
		const cell = svg
			.selectAll("g")
			.data(root.leaves())
			.enter()
			.append("g")
			.attr("transform", (d) => `translate(${d.x0},${d.y0})`);

		// Add rectangles
		cell.append("rect")
			.attr("class", "tile")
			.attr("data-name", (d) => d.data.name)
			.attr("data-category", (d) => d.data.category)
			.attr("data-value", (d) => d.data.value)
			.attr("width", (d) => d.x1 - d.x0)
			.attr("height", (d) => d.y1 - d.y0)
			.attr("fill", (d) => colorScale(d.parent.data.name))
			.on("mousemove", (event, d) => {
				const [x, y] = d3.pointer(event, document.body);

				tooltip
					.style("display", "block")
					.style("left", x + 10 + "px")
					.style("top", y - 60 + "px")
					.attr("data-value", d.data.value);

				tooltip.select(".game-name").text(d.data.name);
				tooltip.select(".category").text(`Category: ${d.parent.data.name}`);
				tooltip.select(".value").text(`Value: ${d.data.value}M`);
			})
			.on("mouseout", () => {
				tooltip.style("display", "none");
			});

		// Add text labels
		cell.append("text")
			.attr("class", "tile-text")
			.selectAll("tspan")
			.data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
			.enter()
			.append("tspan")
			.attr("x", 4)
			.attr("y", (d, i) => 13 + i * 10)
			.text((d) => d);

		// Create legend
		const legend = svg
			.append("g")
			.attr("id", "legend")
			.attr("transform", `translate(0, ${HEIGHT + 10})`);

		const categories = root.children.map((d) => d.data.name);
		const legendItems = legend
			.selectAll("g")
			.data(categories)
			.enter()
			.append("g")
			.attr("transform", (d, i) => `translate(${Math.floor(i / 3) * 250}, ${(i % 3) * 25})`);

		// Add legend rectangles
		legendItems
			.append("rect")
			.attr("class", "legend-item")
			.attr("width", 15)
			.attr("height", 15)
			.attr("fill", (d) => colorScale(d));

		// Add legend text
		legendItems
			.append("text")
			.attr("class", "legend-label")
			.attr("x", 20)
			.attr("y", 12)
			.text((d) => d);
	})
	.catch((error) => {
		console.error("Error loading the dataset:", error);
	});
