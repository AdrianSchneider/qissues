import * as blessed from 'blessed';
import FilterSet    from '../../domain/model/filterSet';

export default function(parent: blessed.Widgets.Node, filters: FilterSet) {
  const view = new blessed.widget.List({
    name: 'filters',
    parent: parent,
    width: '40%',
    height: '20%',
    top: 'center',
    left: 'center',
    tags: true,
    bg: 'lightblack',
    selectedFg: 'black',
    selectedBg: 'yellow',
    keys: true,
    vi: true,
    label: '{green-fg}Filters{/green-fg}',
    border: {
      type: 'line',
      fg: 'lightgreen'
    }
  });

  view.key(['escape', 'h', 'enter'], () => {
    parent.remove(view);
    parent.screen.render();
  });

  view.key(['delete', 'enter', 'x'], (text, i) => {
    filters.remove(view.selected);
    view.removeItem(view.selected);
    parent.remove(view);
    parent.screen.render();
  });

  view.setItems(
    filters.serialize().map(filter => `${filter.type} = ${filter.value}`)
  );

  view.select(0);
  view.focus();

  parent.screen.render();
};
